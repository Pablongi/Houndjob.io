# /backend/scrapers/diagnose_laborum.py
import asyncio
from playwright.async_api import async_playwright


async def diagnose_laborum():
    print("🔍 === DIAGNÓSTICO DIRECTO DE LABORUM ===")
    print("Cargando página principal...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        url = "https://www.laborum.cl/empleos.html"
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(6000)   # más tiempo para React

        html = await page.content()

        # Guardar HTML completo
        with open("laborum_diagnostic.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("💾 HTML guardado en: laborum_diagnostic.html")

        # Probar selectores comunes
        selectors = [
            'article[data-testid="job-card"]',
            'div[class*="job-card"]',
            'article',
            'div.sc-hOcgrv',
            'div[class*="card"]',
            'div[class*="offer"]',
            'li[class*="job"]',
            '.job-item',
            '[class*="job"]',
        ]

        print("\n📊 RESULTADOS DE SELECTORES:")
        for sel in selectors:
            count = len(await page.query_selector_all(sel))
            print(f"   → {sel:45} → {count:3d} elementos")

        # Mostrar parte del HTML
        print("\n📝 Primeros 1000 caracteres del body:")
        body = await page.evaluate("document.body.innerText")
        print(body[:1000])

        await browser.close()
        print("\n✅ Diagnóstico terminado. Revisa el archivo laborum_diagnostic.html")


if __name__ == "__main__":
    asyncio.run(diagnose_laborum())