import os
from dotenv import load_dotenv
from supabase import create_client
import logging
from datetime import datetime

load_dotenv()
logger = logging.getLogger(__name__)
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

def upsert_job_batch(jobs: list) -> bool:
    job_clean_list = []
    for job in jobs:
        job_clean = {
            "title": job.get("title", "Sin título"),
            "company": job.get("company", "Sin empresa"),
            "city": job.get("city", "Sin ciudad"),
            "region": job.get("region"),
            "comuna": job.get("comuna"),
            "description": job.get("description"),
            "salary": job.get("salary"),
            "experience": job.get("experience"),
            "date_posted": job.get("date_posted"),
            "link": job["link"],
            "company_logo": job.get("company_logo"),
            "source": job.get("source", "Unknown"),
            "is_active": True,
            "scraped_at": datetime.utcnow().isoformat() + "Z"
        }
        job_clean_list.append(job_clean)
    
    try:
        result = supabase.table('job_offers').upsert(job_clean_list, on_conflict='link').execute()
        if result.data:
            logger.info(f"Batch guardado: {len(result.data)} jobs")
            return True
        else:
            logger.error(f"Falló batch upsert: {result.error}")
            return False
    except Exception as e:
        logger.error(f"Error batch en Supabase: {str(e)}")
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