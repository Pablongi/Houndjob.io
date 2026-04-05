# /backend/utils/tags.py
import re
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# Creamos el cliente SUPABASE aquí (dentro del módulo) para evitar circular import
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

def normalize_text(text: str) -> str:
    if not text:
        return ""
    return re.sub(r'[^\w\s]', '', text.lower().strip())

def extract_tags(description: str):
    if not description or description.strip() == "Sin descripción":
        return []

    normalized = normalize_text(description)
    found = []

    result = supabase.table('tags').select('id, name').execute()
    tags_list = result.data or []

    for tag_row in tags_list:
        tag_name = tag_row['name']
        if normalize_text(tag_name) in normalized:
            found.append({
                "tag": tag_name,
                "tag_id": tag_row['id']
            })

    seen = set()
    return [t for t in found if not (t["tag"] in seen or seen.add(t["tag"]))]

def link_tags_to_job(job_id: str, description: str):
    if not description:
        return

    found_tags = extract_tags(description)
    if not found_tags:
        return

    inserts = [{"job_id": job_id, "tag_id": t["tag_id"]} for t in found_tags]

    try:
        supabase.table('job_tags').upsert(inserts).execute()
        print(f"   🔗 {len(inserts)} tags enlazados al job {job_id[:8]}...")
    except Exception as e:
        print(f"   ⚠️ Error enlazando tags: {e}")