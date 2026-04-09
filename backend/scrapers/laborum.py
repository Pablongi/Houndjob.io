# /backend/scrapers/laborum.py
import os
from pathlib import Path
from dotenv import load_dotenv

# ←←← Carga el .env desde la raíz del proyecto (funciona siempre)
BASE_DIR = Path(__file__).resolve().parent.parent  # sube a la carpeta houndjob/
load_dotenv(BASE_DIR / ".env")

from scrapers.base_scraper import BaseScraper
import asyncio
import random
from playwright.async_api import async_playwright
from scrapegraphai.graphs import SmartScraperGraph
from utils.logger import logger

class LaborumScraper(BaseScraper):
    name = "Laborum"
    difficulty = 3
    supported_countries = ["cl"]
    max_pages = 1

    def __init__(self):
        super().__init__()
        self.llm_config = {
            "api_key": os.getenv("GROQ_API_KEY"),
            "model": "llama-3.3-70b-versatile",
        }

    async def scrape(self, country_code: str = "cl", max_pages: int = None):
        jobs = []
        logger.info(f"🚀 {self.name} - Iniciando con Playwright + HTML directo a ScrapeGraphAI")

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
                    viewport={"width": 1920, "height": 1080},
                    extra_http_headers={
                        "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                        "Referer": "https://www.google.com/",
                        "Sec-Fetch-Site": "none",
                        "Sec-Fetch-Mode": "navigate",
                    }
                )

                page = await context.new_page()
                await page.goto("https://www.laborum.cl/empleos.html", wait_until="domcontentloaded", timeout=90000)
                await page.wait_for_timeout(random.randint(8000, 15000))  # más tiempo humano

                html = await page.content()
                with open("laborum_raw_html.html", "w", encoding="utf-8") as f:
                    f.write(html)
                logger.info("💾 HTML crudo guardado (para diagnóstico)")

                await browser.close()

            # ←←← AQUÍ ESTÁ EL CAMBIO IMPORTANTE ←←←
            # Pasamos el HTML directamente en vez de la URL
            def run_graph():
                graph = SmartScraperGraph(
                    prompt="""
                    Eres un experto en extracción de empleos. Analiza el HTML de Laborum y extrae TODOS los empleos visibles.
                    Devuelve SOLO un array JSON válido con este formato exacto:
                    [
                      {
                        "title": "...",
                        "company": "...",
                        "city": "...",
                        "region": "...",
                        "description": "...",
                        "salary": "...",
                        "link": "..."
                      }
                    ]
                    """,
                    source=html,                    # ← HTML en vez de URL
                    config={"llm": self.llm_config}
                )
                return graph.run()

            result = await asyncio.to_thread(run_graph)
            logger.info(f"📥 Respuesta cruda de Groq: {result}")

            if isinstance(result, list) and len(result) > 0:
                for item in result:
                    job = self.create_job(
                        title=item.get("title", "Sin título"),
                        company=item.get("company", "Sin empresa"),
                        city=item.get("city", "Sin ciudad"),
                        region=item.get("region", "Metropolitana"),
                        description=item.get("description", ""),
                        salary=item.get("salary"),
                        link=item.get("link", ""),
                        source_url="https://www.laborum.cl/empleos.html"
                    )
                    jobs.append(job)
                logger.success(f"✅ ScrapeGraphAI extrajo {len(jobs)} empleos de Laborum")
            else:
                logger.warning("⚠️ Groq devolvió array vacío")

        except Exception as e:
            logger.error(f"❌ Error en Laborum: {e}")

        return jobs


if __name__ == "__main__":
    scraper = LaborumScraper()
    asyncio.run(scraper.run("cl"))