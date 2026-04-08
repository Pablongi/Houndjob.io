# /backend/scrapers/runner.py
import asyncio
from scrapers.registry import get_active_scrapers, get_scraper_for_portal   # ← CORREGIDO
from utils.logger import logger

async def run_all_scrapers():
    scrapers = get_active_scrapers()
    logger.info(f"🚀 Iniciando scrape completo - {len(scrapers)} portales activos")

    tasks = []
    for name, config in scrapers.items():
        scraper = config["class"]()
        tasks.append(scraper.run("cl"))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    total_jobs = 0
    for name, result in zip(scrapers.keys(), results):
        if isinstance(result, Exception):
            logger.error(f"❌ {name} falló: {result}")
        else:
            total_jobs += result or 0

    logger.success(f"🎉 Scrape finalizado - Total empleos procesados: {total_jobs}")


async def run_single_portal(portal_name: str, country_code: str = "cl"):
    scraper = get_scraper_for_portal(portal_name)
    if not scraper:
        logger.error(f"Portal {portal_name} no encontrado o inactivo")
        return 0
    jobs = await scraper.run(country_code)
    logger.info(f"✅ {portal_name} → {jobs} empleos")
    return jobs


if __name__ == "__main__":
    asyncio.run(run_all_scrapers())