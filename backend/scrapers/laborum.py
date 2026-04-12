from scrapers.base_scraper import BaseScraper
import asyncio
import random
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from utils.logger import logger


class LaborumScraper(BaseScraper):
    name = "Laborum"
    difficulty = 2
    supported_countries = ["cl"]
    max_pages = 1
    max_jobs = 20

    async def scrape(self, country_code: str = "cl", max_pages: int = None):
        jobs = []
        logger.info(f"🚀 {self.name} - Iniciando versión simplificada (solo página 1 + {self.max_jobs} empleos)")

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    viewport={"width": 1920, "height": 1080},
                )
                page = await context.new_page()

                url = "https://www.laborum.cl/empleos.html"
                logger.info(f"📄 Cargando página 1 → {url}")

                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                await page.wait_for_timeout(random.randint(7000, 10000))

                html = await page.content()
                soup = BeautifulSoup(html, "html.parser")

                with open("laborum_pagina_1.html", "w", encoding="utf-8") as f:
                    f.write(html)

                job_links = soup.select("a[href*='/empleos/']")

                logger.info(f"🔍 Encontrados {len(job_links)} enlaces de empleo en página 1")

                for i, link in enumerate(job_links[:self.max_jobs]):
                    try:
                        title_elem = link.select_one("h2, h3")
                        title = title_elem.get_text(strip=True) if title_elem else "Sin título"

                        company_elem = link.select_one("h3")
                        company = company_elem.get_text(strip=True) if company_elem and company_elem != title_elem else "Sin empresa"

                        job_url = "https://www.laborum.cl" + link["href"]

                        if title and title != "Sin título":
                            job = self.create_job(
                                title=title,
                                company=company,
                                city="Santiago",
                                region="Metropolitana",
                                description="Extraído de Laborum (página 1)",
                                link=job_url,
                                source_url=url
                            )
                            jobs.append(job)
                            logger.info(f"   ✓ Empleo {len(jobs)}: {title[:70]}...")

                    except Exception:
                        continue

                await browser.close()

            logger.info(f"✅ Laborum → {len(jobs)} empleos extraídos de la primera página")
            return jobs

        except Exception as e:
            logger.error(f"❌ Error en Laborum: {e}")
            return jobs


if __name__ == "__main__":
    scraper = LaborumScraper()
    asyncio.run(scraper.run("cl"))