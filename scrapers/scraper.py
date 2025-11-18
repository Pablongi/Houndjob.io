import asyncio
from aiohttp import ClientSession
import json
from utils import portals, logger, async_scrape_requests, scrape_with_playwright, validate_offer, get_proxy, get_user_agent

async def scrape_portal(portal, session):
    name = portal['name']
    url = portal['url']
    selector = portal.get('selector')
    extract_func = portal.get('extract_func')
    use_browser = portal.get('use_browser', False)
    max_offers = 10  # Aumentado de 3 a 10

    try:
        if use_browser:
            offers, diag = await scrape_with_playwright(url, selector, extract_func, portal_name=name, max_offers=max_offers)
        else:
            headers = {"User-Agent": get_user_agent()}
            proxy = get_proxy()
            offers, diag = await async_scrape_requests(session, url, headers, proxy, selector, extract_func, max_offers=max_offers, portal_name=name)
        
        valid_offers = [o for o in offers if validate_offer(o)]
        if valid_offers:
            logger.info(f"Success {name}: {len(valid_offers)} empleos")
        else:
            logger.warning(f"Failed {name}: {diag['message']}")
        return name, valid_offers
    except Exception as e:
        logger.warning(f"Failed {name}: {str(e)}")
        return name, []

async def main():
    print("Scraping Jobs...")
    print("=" * 60)
    
    all_jobs = {}
    active_portals = [p for p in portals if p.get('active', True)]
    
    async with ClientSession() as session:
        tasks = [scrape_portal(p, session) for p in active_portals]
        results = await asyncio.gather(*tasks)
    
    for name, jobs in results:
        all_jobs[name] = jobs
    
    with open('empleos.json', 'w', encoding='utf-8') as f:
        json.dump(all_jobs, f, ensure_ascii=False, indent=4)
    
    total = sum(len(j) for j in all_jobs.values())
    print(f"\nSuccess! {total} JOBS SAVED in empleos.json!")

if __name__ == "__main__":
    asyncio.run(main())