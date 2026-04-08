# /backend/scrapers/diagnose_portal.py
import asyncio
import os
from playwright.async_api import async_playwright
from scrapers.registry import get_scraper_for_portal
from utils.logger import logger


async def diagnose_portal(portal_name: str = "Laborum", url: str = None, save_html: bool = True):
    """
    Diagnosticador genérico para cualquier portal.
    - Si el portal está en el registry → usa su configuración.
    - Si le pasas una URL directa → la usa.
    """
    print(f"\n🔍 === DIAGNÓSTICO DE {portal_name.upper()} ===")

    # Intentar cargar el scraper del registry
    scraper = get_scraper_for_portal(portal_name)
    base_url = url or (scraper.base_url if scraper else None)

    if not base_url:
        base_url = input(f"   No se encontró URL para {portal_name}. Ingresa la URL manualmente: ").strip()

    print(f"🌐 Cargando URL: {base_url}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        await page.goto(base_url, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(5000)  # Espera render React/JS

        # Guardar HTML completo
        html = await page.content()
        if save_html:
            filename = f"diagnose_{portal_name.lower()}.html"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(html)
            print(f"💾 HTML completo guardado → {filename}")

        # Selectores comunes a probar
        common_selectors = [
            'article[data-testid="job-card"]',
            'div[class*="job-card"]',
            'article',
            'div.sc-hOcgrv',
            'div[class*="card"]',
            'div[class*="offer"]',
            'li[class*="job"]',
            '.job-item',
            '[class*="job"]',
            'div[class*="listing"]',
        ]

        print("\n📊 RESULTADOS DE SELECTORES:")
        for selector in common_selectors:
            count = len(await page.query_selector_all(selector))
            status = "✅" if count > 0 else "❌"
            print(f"   {status} {selector:45} → {count:3d} elementos")

        # Mostrar estructura del body (primeros 1000 caracteres)
        body_text = await page.evaluate("document.body.innerText")
        print("\n📝 Muestra del contenido visible (primeros 800 caracteres):")
        print(body_text[:800])

        await browser.close()

    print(f"\n✅ Diagnóstico de {portal_name} finalizado.\n")
    print("Consejo: Abre el archivo .html generado y busca clases que contengan 'job', 'card', 'offer', etc.")


if __name__ == "__main__":
    portal = input("Ingresa el nombre del portal a diagnosticar (ej: Laborum): ").strip() or "Laborum"
    asyncio.run(diagnose_portal(portal_name=portal))