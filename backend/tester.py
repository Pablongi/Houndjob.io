import asyncio
import time
import nest_asyncio
nest_asyncio.apply()
from utils import portals, logger, load_cache, save_cache, async_scrape_requests, scrape_with_playwright, validate_offer, get_proxy
from aiohttp import ClientSession
import requests
from bs4 import BeautifulSoup

def test_portal_simple(portal):
    name = portal['name']
    url = portal['url']
    selector = portal.get('selector')
    extract_func = portal.get('extract_func')
    
    cache = load_cache(name)
    if cache:
        valid_offers = [o for o in cache if validate_offer(o)]
        if valid_offers:
            return {"success": True, "message": "Cache hit con ofertas válidas", "time_taken": 0.0}
    
    start_time = time.time()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        time_taken = time.time() - start_time
        
        if response.status_code != 200:
            return {"success": False, "message": f"HTTP {response.status_code}", "time_taken": time_taken}
        
        soup = BeautifulSoup(response.text, 'html.parser')
        offers = soup.select(selector) if selector else []
        
        if offers:
            # Prueba el primero
            job = extract_func(offers[0], url)
            if validate_offer(job):
                return {"success": True, "message": f"¡{len(offers)} ofertas encontradas!", "time_taken": time_taken}
        
        return {"success": False, "message": "No se encontraron ofertas", "time_taken": time_taken}
        
    except Exception as e:
        time_taken = time.time() - start_time
        return {"success": False, "message": str(e), "time_taken": time_taken}

def run_tester_simple():
    print("🔍 TESTING 4 PORTALES (SOLO REQUESTS - SIN PLAYWRIGHT)")
    print("=" * 60)
    
    for portal in portals:
        if not portal.get('active', True):
            continue
            
        print(f"\n🚀 Probando: {portal['name']}")
        result = test_portal_simple(portal)
        status = "✅ Sirve" if result['success'] else "❌ No sirve"
        time_taken = result['time_taken']
        
        print(f"   {status} | {time_taken:.1f}s")
        print(f"   Mensaje: {result['message']}")
        
        if result['success']:
            logger.info(f"✅ {portal['name']}: OK")
        else:
            logger.warning(f"❌ {portal['name']}: {result['message']}")
    
    print("\n🎉 ¡TEST COMPLETO!")

if __name__ == "__main__":
    run_tester_simple()