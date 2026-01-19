from db import get_jobs

def show_jobs():
    try:
        jobs = get_jobs(limit=100)
        total = len(jobs)
        print(f"\n📋 {total} JOBS EN SUPABASE:")
        print("=" * 80)
        
        for i, job in enumerate(jobs, 1):
            print(f"{i}. {job['title']} | {job['company']} | {job['region']} | {job['city']} | {job['comuna']} | Salario: {job['salary']} | Fecha: {job['scraped_at']}")
            desc_snippet = job['description'][:100] + "..." if len(job['description']) > 100 else job['description']
            print(f"     Descripción: {desc_snippet}")
            print(f"     🔗 {job['link']}")
            print()
    except Exception as e:
        print(f"❌ Error: {e}.")

if __name__ == "__main__":
    show_jobs()