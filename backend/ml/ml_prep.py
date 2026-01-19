import os
from dotenv import load_dotenv
from supabase import create_client
import pandas as pd
import json
from datetime import datetime, timedelta

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

CACHE_FILE = 'prep_cache.json'

def load_prep_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r') as f:
            cache = json.load(f)
            cache_time = datetime.fromisoformat(cache.get('timestamp'))
            if (datetime.now() - cache_time) < timedelta(hours=6):  # Cache 6h
                return pd.DataFrame(cache['data'])
    return None

def save_prep_cache(df):
    cache = {'data': df.to_dict('records'), 'timestamp': datetime.now().isoformat()}
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f)

def normalize_text(text: str) -> str:
    return text.lower().strip() if text else ""

def fetch_jobs(limit=500):
    cache_df = load_prep_cache()
    if cache_df is not None:
        return cache_df.to_dict('records')
    
    result = supabase.table('job_offers').select("title, description, company, link").eq('is_active', True).limit(limit).execute()
    jobs = result.data or []
    df = pd.DataFrame(jobs)
    df['title'] = df['title'].apply(normalize_text)
    df['description'] = df['description'].apply(normalize_text)
    df['text'] = df['title'] + ' ' + df['description']
    save_prep_cache(df)
    return jobs

def prepare_data():
    jobs = fetch_jobs()
    df = pd.DataFrame(jobs)
    df.to_csv('jobs_data.csv', index=False)
    print(f"Preparados {len(df)} jobs. Exporta a jobs_data.csv – etiqueta manual ~100 en Google Sheets (agrega cols: category, homologated_salary, homologated_experience). Guarda como labeled_jobs.csv.")

if __name__ == "__main__":
    prepare_data()