import asyncio
import time
from scraper import portals  # Importamos la lista de portales desde scraper.py
from utils import logger, load_cache, get_proxy, validate_offer  # Solo lo necesario
from aiohttp import ClientSession
from bs4 import BeautifulSoup

async def test_portal(portal, session):
    name = portal['name']
    cache = load_cache(name)
    if cache:
        return {
            "success": True,
            "message": "Cache OK (datos frescos encontrados)",
            "time_taken": 0.0  # <-- Agregado para evitar KeyError
        }

    url = portal['url']
    selector = portal.get('selector')
    extract_func = portal.get('extract_func')
    
    start_time = time.time()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
    }
    proxy = get_proxy()  # Ya pre-validado
    
    try:
        async with session.get(url, headers=headers, proxy=proxy, timeout=15) as response:
            if response.status != 200:
                return {
                    "success": False,
                    "message": f"HTTP {response.status}",
                    "time_taken": time.time() - start_time
                }
            text = await response.text()
            soup = BeautifulSoup(text, 'html.parser')
            offers = soup.select(selector) if selector else []
            
            # Fallback genérico si el selector principal no encuentra nada
            if not offers:
                offers = soup.find_all(['article', 'div', 'li', 'section'],
                                       class_=lambda x: x and any(k in str(x).lower() for k in ['job', 'oferta', 'vacancy', 'listing', 'item', 'card', 'result']))
            
            job_offers = []
            if offers and extract_func:
                job_offers = [extract_func(o, url) for o in offers[:3]]
            
            valid = [j for j in job_offers if validate_offer(j)]
            time_taken = time.time() - start_time
            return {
                "success": bool(valid),
                "message": f"{len(valid)} válidas / {len(job_offers)} encontradas",
                "time_taken": time_taken
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error: {str(e)[:100]}",  # Trunco el error para que no sea muy largo
            "time_taken": time.time() - start_time
        }

async def run_tester():
    active_portals = [p for p in portals if p.get('active', True)]
    
    print("🔍 TESTING PORTALES")
    print("=" * 80)
    
    async with ClientSession() as session:
        tasks = [test_portal(p, session) for p in active_portals]
        results = await asyncio.gather(*tasks)
    
    success_count = 0
    for portal, result in zip(active_portals, results):
        status = "✅" if result['success'] else "❌"
        print(f"{portal['name']:25} {status} | {result['time_taken']:5.1f}s | {result['message']}")
        if result['success']:
            success_count += 1
    
    print("=" * 80)
    print(f"RESUMEN: {success_count}/{len(active_portals)} portales funcionando correctamente")

if __name__ == "__main__":
    asyncio.run(run_tester())