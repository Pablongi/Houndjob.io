# /backend/scrapers/base_scraper.py
import asyncio
import hashlib
import json
import time
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List

# from aiohttp import ClientSession          # descomentar cuando lo necesites
# from bs4 import BeautifulSoup
# from playwright.async_api import async_playwright

from db import upsert_job_batch
from utils.logger import logger


class BaseScraper(ABC):
    """Clase base para todos los scrapers"""
    
    name: str
    difficulty: int = 1
    supported_countries: list[str] = ["cl"]
    prefer_api: bool = False
    max_pages: int = 10
    delay_between_pages: float = 2.5
    portal_logo: str = ""

    def __init__(self):
        if not self.portal_logo:
            self.portal_logo = f"/portals/{self.name.lower()}.svg"

    def generate_hash(self, job: dict) -> str:
        key = f"{job.get('title','')}{job.get('company','')}{job.get('link','')}{job.get('city','')}"
        return hashlib.sha256(key.encode()).hexdigest()

    def create_job(self, **kwargs) -> dict:
        """Crea un job unificado con extra_data para máxima riqueza"""
        job = {
            "title": kwargs.get("title", "Sin título"),
            "company": kwargs.get("company", "Sin empresa"),
            "city": kwargs.get("city", "Sin ciudad"),
            "region": kwargs.get("region", "Sin región"),
            "comuna": kwargs.get("comuna", ""),
            "country": kwargs.get("country", "Chile"),
            "description": kwargs.get("description", ""),
            "experience": kwargs.get("experience", "Sin experiencia"),
            "salary_min": kwargs.get("salary_min"),
            "salary_max": kwargs.get("salary_max"),
            "salary_currency": "CLP",
            "salary_period": kwargs.get("salary_period", "mensual"),
            "date_posted": kwargs.get("date_posted"),
            "time_since_posted": kwargs.get("time_since_posted", "Sin tiempo"),
            "link": kwargs.get("link", ""),
            "company_logo": kwargs.get("company_logo"),
            "portal_logo": self.portal_logo,
            "portal": self.name,
            "source_url": kwargs.get("source_url", ""),
            "is_active": True,
            "views": kwargs.get("views", 0),
            "job_hash": self.generate_hash(kwargs),
            "extra_data": json.dumps(kwargs.get("extra_data", {}))
        }
        return job

    @abstractmethod
    async def scrape(self, country_code: str = "cl", max_pages: int = None) -> List[dict]:
        """Cada scraper debe implementar este método"""
        pass

    async def run(self, country_code: str = "cl"):
        """Método que se llama desde runner.py"""
        logger.info(f"🚀 {self.name} - Iniciando scrape para {country_code.upper()}")
        start = time.time()

        jobs = await self.scrape(country_code, self.max_pages)

        if jobs:
            success = await upsert_job_batch(jobs)
            duration = round(time.time() - start, 2)
            logger.success(f"✅ {self.name} → {len(jobs)} empleos guardados en {duration}s")
        else:
            logger.warning(f"⚠️ {self.name} → No se obtuvieron empleos")


# ====================== DEBUG ======================
if __name__ == "__main__":
    print("=== base_scraper.py cargado correctamente ===")
    print("Clase BaseScraper disponible")