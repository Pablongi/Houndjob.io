import os
import hashlib
from dotenv import load_dotenv
from supabase import create_client
import logging
from datetime import datetime

load_dotenv()
logger = logging.getLogger(__name__)
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

def generate_job_hash(job: dict) -> str:
    """
    Genera un hash único basado en título, empresa, portal y fecha de publicación.
    Esto evita duplicados incluso si el link cambia ligeramente.
    """
    key = (
        str(job.get('title', '')).strip().lower() +
        str(job.get('company', '')).strip().lower() +
        str(job.get('source', '')).lower() +
        str(job.get('date_posted', ''))
    )
    return hashlib.md5(key.encode('utf-8')).hexdigest()

def upsert_job_batch(jobs: list) -> bool:
    job_clean_list = []
    for job in jobs:
        job_hash = generate_job_hash(job)
        job_clean = {
            "title": job.get("title", "Sin título"),
            "company": job.get("company", "Sin empresa"),
            "city": job.get("city", "Sin ciudad"),
            "region": job.get("region"),
            "comuna": job.get("comuna"),
            "description": job.get("description"),
            "experience": job.get("experience"),
            "salary": job.get("salary"),
            "date_posted": job.get("date_posted"),
            "time_since_posted": job.get("time_since_posted"),
            "link": job["link"],
            "company_logo": job.get("company_logo"),
            "portal_logo": job.get("portal_logo"),
            "source": job.get("source", "Unknown"),
            "is_active": True,
            "scraped_at": datetime.utcnow().isoformat() + "Z",
            "job_hash": job_hash,
        }
        job_clean_list.append(job_clean)
    
    try:
        result = supabase.table('job_offers') \
            .upsert(job_clean_list, on_conflict=['job_hash', 'link']) \
            .execute()
        
        if result.data:
            logger.info(f"Upsert OK: {len(result.data)} jobs nuevos/deduplicados")
            return True
        else:
            logger.error(f"Falló upsert: {result.error}")
            return False
    except Exception as e:
        logger.error(f"Error upsert en Supabase: {str(e)}")
        return False

def get_jobs(limit=50):
    result = supabase.table('job_offers').select("*").eq('is_active', True).order('scraped_at', desc=True).limit(limit).execute()
    return result.data or []

def test_connection():
    try:
        result = supabase.table('job_offers').select('*', count='exact').execute()
        print("Conexión OK:", result.count if result.count else "Tabla vacía")
    except Exception as e:
        print("Error conexión:", str(e))

if __name__ == "__main__":
    test_connection()