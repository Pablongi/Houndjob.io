import os
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

def normalize_text(text: str) -> str:
    return text.lower().strip() if text else ""

def fetch_jobs(limit=1000):
    result = supabase.table('job_offers').select("title, description, company, link").eq('is_active', True).limit(limit).execute()
    return result.data or []

def prepare_data():
    jobs = fetch_jobs()
    df = pd.DataFrame(jobs)
    df['title'] = df['title'].apply(normalize_text)
    df['description'] = df['description'].apply(normalize_text)
    df['text'] = df['title'] + ' ' + df['description']
    df.to_csv('jobs_data.csv', index=False)
    print(f"Preparados {len(df)} jobs. Exporta a jobs_data.csv – etiqueta manual ~100 en Google Sheets (agrega cols: category, homologated_salary, homologated_experience). Guarda como labeled_jobs.csv.")

if __name__ == "__main__":
    prepare_data()