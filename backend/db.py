import os
from dotenv import load_dotenv
from supabase import create_client, Client
import logging
from datetime import datetime

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def upsert_job(job: dict) -> bool:
    job_clean = {
        "title":        job.get("title", "Sin título"),
        "company":      job.get("company", "Sin empresa"),
        "city":         job.get("city", "Sin ciudad"),
        "region":       job.get("region"),
        "comuna":       job.get("comuna"),
        "description":  job.get("description"),
        "salary":       job.get("salary"),
        "experience":   job.get("experience"),
        "date_posted":  job.get("date_posted"),
        "link":         job["link"],
        "company_logo": job.get("company_logo"),
        "source":       job.get("source", "Unknown"),
        "is_active":    True,
        "scraped_at":   datetime.utcnow().isoformat() + "Z"
    }
    
    try:
        result = supabase.table('job_offers').upsert(job_clean, on_conflict='link').execute()
        
        if result.data:
            logger.info(f"Guardado → {job_clean['title'][:60]}")
            return True
        else:
            logger.error(f"Falló upsert → {result.error}")
            return False
    except Exception as e:
        logger.error(f"Error al guardar en Supabase → {str(e)}")
        return False

def get_jobs():
    result = supabase.table('job_offers') \
                     .select("*") \
                     .eq('is_active', True) \
                     .order('scraped_at', desc=True) \
                     .limit(50) \
                     .execute()
    return result.data or []

def test_connection():
    try:
        result = supabase.table('job_offers').select('*', count='exact').execute()  # Fix count
        print("Conexión OK:", result.count if result.count else "Tabla vacía")
    except Exception as e:
        print("Error conexión:", str(e))

if __name__ == "__main__":
    test_connection()