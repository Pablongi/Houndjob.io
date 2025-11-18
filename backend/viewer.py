import json

def show_jobs():
    try:
        with open('empleos.json', 'r', encoding='utf-8') as f:
            all_jobs = json.load(f)
        
        total = sum(len(jobs) for jobs in all_jobs.values())
        print(f"\n📋 {total} EMPLEOS ENCONTRADOS:")
        print("=" * 80)
        
        for name, jobs in all_jobs.items():
            print(f"\n🔹 PORTAL: {name} ({len(jobs)} jobs)")
            for i, job in enumerate(jobs, 1):
                print(f"  {i}. {job['title']} | {job['company']} | {job['region']} | {job['city']} | {job['comuna']} | Salario: {job['salary']} | Fecha: {job['date_posted']}")
                desc_snippet = job['description'][:100] + "..." if len(job['description']) > 100 else job['description']
                print(f"     Descripción: {desc_snippet}")
                print(f"     🔗 {job['link']}")
                print()
        
    except FileNotFoundError:
        print("❌ Corre scraper.py primero para generar empleos.json")
    except UnicodeDecodeError as e:
        print(f"❌ Error de encoding: {e}. Borra empleos.json y re-corre scraper.py.")
    except json.JSONDecodeError as e:
        print(f"❌ Error en JSON: {e}. Borra el archivo y re-scrape.")
    except Exception as e:
        print(f"❌ Error inesperado: {e}.")

if __name__ == "__main__":
    show_jobs()