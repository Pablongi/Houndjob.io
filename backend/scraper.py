# scraper.py → Con retries (3 intentos por portal), monitoreo % éxito
import asyncio
from aiohttp import ClientSession
from utils import portals, logger, async_scrape_requests, scrape_with_playwright, validate_offer, get_proxy, get_user_agent, fix_time_since_posted, is_location, normalize_date_posted
from db import upsert_job
import pandas as pd
from ml.ml_homologate import advanced_homologate

def homologate_jobs(jobs_batch):
    df = pd.DataFrame(jobs_batch)
    # Llama advanced (adapta para batch)
    advanced_homologate()  # O procesa df directo

async def scrape_portal(portal, session):
    name = portal['name']
    url = portal['url']
    selector = portal.get('selector')
    extract_func = portal.get('extract_func')
    use_browser = portal.get('use_browser', False)
    max_offers = 50

    for attempt in range(3):  # Retries
        try:
            if use_browser:
                offers, diag = await scrape_with_playwright(url, selector, extract_func, portal_name=name, max_offers=max_offers)
            else:
                headers = {"User-Agent": get_user_agent()}
                proxy = get_proxy()
                offers, diag = await async_scrape_requests(session, url, headers, proxy, selector, extract_func, max_offers=max_offers, portal_name=name)
            
            valid_offers = []
            for j in offers:
                if validate_offer(j):
                    j["source"] = name
                    if is_location(j.get("date_posted", "")):
                        j["date_posted"] = "Sin fecha"
                    j["date_posted"] = normalize_date_posted(j.get("date_posted", ""))
                    fix_time_since_posted(j)
                    valid_offers.append(j)
                    
            print(f"{name}: {len(valid_offers)} valid offers: {valid_offers}")

            saved = 0
            for job in valid_offers:
                if upsert_job(job):
                    saved += 1
            
            homologate_jobs(valid_offers)

            if saved > 0:
                logger.info(f"Success {name}: {saved} empleos guardados en Supabase")
            else:
                logger.warning(f"Failed {name}: {diag.get('message', 'No valid offers')}")
            return name, saved, len(valid_offers) / max_offers * 100 if valid_offers else 0  # % éxito
            
        except Exception as e:
            logger.warning(f"Attempt {attempt+1} failed for {name}: {str(e)}")
            if attempt == 2:
                return name, 0, 0

async def main():
    try:
        print("Scraping Jobs...")
        print("=" * 60)
        
        active_portals = [p for p in portals if p.get('active', True)]
        
        async with ClientSession() as session:
            tasks = [scrape_portal(p, session) for p in active_portals]
            results = await asyncio.gather(*tasks)
        
        total = sum(saved for _, saved, _ in results)
        print(f"\nSuccess! {total} JOBS SAVED in Supabase!")
        
        # Monitoreo: % éxito por portal
        for name, saved, success_pct in results:
            logger.info(f"{name}: {success_pct:.2f}% éxito ({saved}/50 jobs)")  # Increased
    except KeyboardInterrupt:
        print("Scraping interrupted manually.")
    except Exception as e:
        logger.error(f"Main error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())