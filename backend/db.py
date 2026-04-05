# /backend/db.py
import os
import hashlib
import logging
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client

from utils.tags import link_tags_to_job   # ← tags

load_dotenv()

logger = logging.getLogger(__name__)
supabase = create_client(
    os.getenv("SUPABASE_URL"), 
    os.getenv("SUPABASE_SERVICE_KEY")
)

def generate_job_hash(job: dict) -> str:
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
            "scraped_at": datetime.now().isoformat() + "Z",
            "job_hash": job_hash,
            "modality": job.get("modality"),
            "views": job.get("views", 0),
        }
        job_clean_list.append(job_clean)
    
    try:
        # ←←← VERSIÓN QUE FUNCIONA
        result = supabase.table('job_offers') \
            .upsert(job_clean_list, on_conflict=['job_hash', 'link']) \
            .execute()

        # Enlazar tags automáticamente
        for job in result.data:
            if job.get("description"):
                link_tags_to_job(job["id"], job["description"])

        print(f"✅ Upsert OK: {len(result.data)} jobs + tags enlazados")
        logger.info(f"Upsert OK: {len(result.data)} jobs + tags enlazados")
        return True

    except Exception as e:
        print(f"❌ Error upsert: {str(e)}")
        logger.error(f"Error upsert en Supabase: {str(e)}")
        return False

def get_jobs(limit=50):
    result = supabase.table('job_offers') \
        .select("*") \
        .eq('is_active', True) \
        .order('scraped_at', desc=True) \
        .limit(limit) \
        .execute()
    return result.data or []

if __name__ == "__main__":
    print("✅ db.py cargado correctamente")