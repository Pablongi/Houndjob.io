import asyncio
from utils import portals, logger, load_cache, validate_proxy
from aiohttp import ClientSession

async def test_portal(portal, session):
    name = portal['name']
    cache = load_cache(name)
    if cache:
        return {"success": True, "message": "Cache OK"}

    url = portal['url']
    selector = portal.get('selector')
    extract_func = portal.get('extract_func')
    
    start_time = time.time()
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"}
    proxy = get_proxy() if validate_proxy(get_proxy()) else None
    
    try:
        async with session.get(url, headers=headers, proxy=proxy, timeout=10) as response:
            if response.status != 200:
                return {"success": False, "message": f"HTTP {response.status}"}
            text = await response.text()
            soup = BeautifulSoup(text, 'html.parser')
            offers = soup.select(selector) if selector else []
        job_offers = [extract_func(o, url) for o in offers[:3]] if offers else []
        valid = [j for j in job_offers if validate_offer(j)]
        time_taken = time.time() - start_time
        return {"success": bool(valid), "message": f"{len(valid)} válidas / {len(job_offers)}", "time_taken": time_taken}
    except Exception as e:
        return {"success": False, "message": str(e), "time_taken": time.time() - start_time}

async def run_tester():
    print("🔍 TESTING PORTALES")
    print("=" * 60)
    
    async with ClientSession() as session:
        tasks = [test_portal(p, session) for p in portals if p.get('active', True)]
        results = await asyncio.gather(*tasks)
    
    for portal, result in zip(portals, results):
        status = "✅" if result['success'] else "❌"
        print(f"{portal['name']}: {status} | {result['time_taken']:.1f}s | {result['message']}")

if __name__ == "__main__":
    asyncio.run(run_tester())