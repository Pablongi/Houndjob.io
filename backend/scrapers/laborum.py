# /backend/scrapers/laborum.py
from scrapers.base_scraper import BaseScraper
import asyncio
import random
from playwright.async_api import async_playwright
from scrapegraphai.graphs import SmartScraperGraph   # ←←← ESTA LÍNEA FALTABA
from utils.logger import logger


class LaborumScraper(BaseScraper):
    name = "Laborum"
    difficulty = 3
    supported_countries = ["cl"]
    max_pages = 1

    def __init__(self):
        super().__init__()
        self.llm_config = {
            "api_key": "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",
            "model": "llama-3.3-70b-versatile",
        }

    async def scrape(self, country_code: str = "cl", max_pages: int = None):
        jobs = []
        logger.info(f"🚀 {self.name} - Iniciando con Playwright + Stealth Manual")

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    viewport={"width": 1920, "height": 1080},
                    extra_http_headers={
                        "Accept-Language": "es-CL,es;q=0.9,en;q=0.8",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                        "Referer": "https://www.google.com/",
                        "DNT": "1",
                    }
                )

                page = await context.new_page()

                await page.goto("https://www.laborum.cl/empleos.html", wait_until="domcontentloaded", timeout=90000)
                await page.wait_for_timeout(random.randint(7000, 12000))

                # Guardamos el HTML crudo para diagnóstico
                html = await page.content()
                with open("laborum_raw_html.html", "w", encoding="utf-8") as f:
                    f.write(html)
                logger.info("💾 HTML crudo guardado en: laborum_raw_html.html")

                await browser.close()

            # Intentamos procesar con Groq
            def run_graph():
                graph = SmartScraperGraph(
                    prompt="Extrae TODOS los empleos visibles en esta página de Laborum. Devuelve solo un array JSON.",
                    source="https://www.laborum.cl/empleos.html",
                    config={"llm": self.llm_config}
                )
                return graph.run()

            result = await asyncio.to_thread(run_graph)
            logger.info(f"📥 Respuesta cruda de Groq: {result}")

        except Exception as e:
            logger.error(f"❌ Error en Laborum: {e}")

        return jobs


if __name__ == "__main__":
    scraper = LaborumScraper()
    asyncio.run(scraper.run("cl"))