# /backend/scheduler.py
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from scraper import main as run_scrape
import os

scheduler = AsyncIOScheduler(timezone="America/Santiago")

async def scheduled_scrape():
    print("🚀 [SCHEDULER] Iniciando scrape programado...")
    await run_scrape()

scheduler.add_job(scheduled_scrape, 'interval', hours=4, id='scrape_job', next_run_time=None)

if __name__ == "__main__":
    print("⏰ APScheduler iniciado (cada 4 horas) – Máquina 2 recomendada")
    scheduler.start()
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()