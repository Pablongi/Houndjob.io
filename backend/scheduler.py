# /backend/scheduler.py
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from scrapers.runner import run_all_scrapers   # ← NUEVO IMPORT
from utils.logger import logger

scheduler = AsyncIOScheduler(timezone="America/Santiago")

async def scheduled_scrape():
    logger.info("🚀 [SCHEDULER] Iniciando scrape programado de todos los portales")
    await run_all_scrapers()

scheduler.add_job(scheduled_scrape, 'interval', hours=4, id='full_scrape')

if __name__ == "__main__":
    logger.info("⏰ Scheduler iniciado - correrá cada 4 horas")
    scheduler.start()
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()