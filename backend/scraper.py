import asyncio
from aiohttp import ClientSession
from utils import logger, load_cache, save_cache, async_scrape_requests, scrape_with_playwright, validate_offer, get_proxy, get_user_agent, fix_time_since_posted, is_location, normalize_date_posted
from db import upsert_job_batch  # Batch para rapidez
from ml.ml_homologate import advanced_homologate
from datetime import datetime, timedelta
import pandas as pd
import os

# MAU levels para frecuencia (cache expire variable)
MAU_LEVELS = {
    'Computrabajo': 1, 'Laborum': 1, 'LinkedIn': 1, 'Jooble': 1,  # Alta: cada 1h
    'Chiletrabajos': 6, 'Opcionempleo': 6, 'Adecco': 6, 'Trabajando': 6, 'Buscojobs': 6, 'ManpowerChile': 6,  # Media: cada 6h
    'Reqlut': 48, 'Robert Walters': 48, 'Robert Half': 48, 'Michael Page': 48, 'Prácticas para Chile': 48, 'Trabaja en el Estado': 48, 'Trovit': 48, 'UnMejorEmpleo': 48, 'Workana': 48  # Baja: cada 48h
}

def get_cache_key(portal_name):
    today = datetime.now().strftime('%Y-%m-%d')
    return os.path.join('cache', f"{portal_name}_{today}.json")

def should_scrape(portal_name):
    cache_file = get_cache_key(portal_name)
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            cache = json.load(f)
            cache_time = datetime.fromisoformat(cache['timestamp'])
            expire = timedelta(hours=MAU_LEVELS.get(portal_name, 6))
            if (datetime.now() - cache_time) < expire:
                logger.info(f"Cache fresco para {portal_name} – Skip")
                return False
    return True

def homologate_jobs(jobs_batch):
    if jobs_batch:
        df = pd.DataFrame(jobs_batch)
        advanced_homologate(df)  # Batch ML

async def scrape_portal(portal, session):
    name = portal['name']
    if not should_scrape(name):
        return name, 0, 100  # 100% si cache

    url = portal['url']
    selector = portal.get('selector')
    extract_func = portal.get('extract_func')
    use_browser = portal.get('use_browser', False)
    max_offers = 20  # Reducido para rapidez

    for attempt in range(3):
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
            
            saved = 0
            if valid_offers:
                if upsert_job_batch(valid_offers):
                    saved = len(valid_offers)
            
            homologate_jobs(valid_offers)

            logger.info(f"{name}: {saved} guardados")
            return name, saved, len(valid_offers) / max_offers * 100 if valid_offers else 0
        except Exception as e:
            logger.warning(f"Attempt {attempt+1} failed for {name}: {str(e)}")
            if attempt == 2:
                return name, 0, 0

async def main():
    print("Scraping Jobs...")
    print("=" * 60)
    
    active_portals = [p for p in portals if p.get('active', True)]
    
    async with ClientSession(connector=aiohttp.TCPConnector(limit=5)) as session:
        tasks = [scrape_portal(p, session) for p in active_portals]
        results = await asyncio.gather(*tasks)
    
    total = sum(saved for _, saved, _ in results)
    print(f"\nSuccess! {total} JOBS SAVED in Supabase!")
    
    for name, saved, success_pct in results:
        logger.info(f"{name}: {success_pct:.2f}% éxito ({saved}/20 jobs)")

if __name__ == "__main__":
    asyncio.run(main())

# ===================================================================
# LISTA DE PORTALES (todo el contenido que tenías – intacto, pegado tal cual)
# ===================================================================
portals = [
    {"name": "Robert Walters", "url": "https://www.robertwalters.cl/vacantes.html", "use_browser": True, "selector": "div.search-result", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('.search-result-title h3 a').get_text(strip=True) if offer.select_one('.search-result-title h3 a') else "Sin título",
         company="Robert Walters",
         region=(loc := offer.select_one('p.result-attrib:has(span.attribute-label:contains("Ubicación:")) span.attribute-value')) and loc.get_text(strip=True).split(',')[0].strip() or "Sin región",
         city=(loc := offer.select_one('p.result-attrib:has(span.attribute-label:contains("Ubicación:")) span.attribute-value')) and loc.get_text(strip=True).split(',')[0].strip() or "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.select_one('.search-result-description').get_text(strip=True) if offer.select_one('.search-result-description') else "Sin descripción",
         experience="Sin experiencia",
         salary=offer.select_one('p.result-attrib:has(span.attribute-label:contains("Salario:")) span.attribute-value').get_text(strip=True) if offer.select_one('p.result-attrib:has(span.attribute-label:contains("Salario:"))') else "Sin salario",
         date_posted=offer.select_one('p.result-attrib:has(span.attribute-label:contains("Fecha de publicación:")) span.attribute-value').get_text(strip=True) if offer.select_one('p.result-attrib:has(span.attribute-label:contains("Fecha de publicación:"))') else "Sin fecha",
         time_since_posted="Sin tiempo",
         link=urljoin(base_url, offer.select_one('.search-result-title h3 a')['href']) if offer.select_one('.search-result-title h3 a') else "Sin enlace",
         company_logo=offer.select_one('.search-result-logo img')['src'] if offer.select_one('.search-result-logo img') else "Sin logo",
         portal_logo="Sin logo",
         source="Robert Walters"
     )},
    {"name": "Opcionempleo", "url": "https://www.opcionempleo.cl/trabajo?s=&l=Chile&start=0", "use_browser": True, "selector": "article.job.clicky", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2 a').get_text(strip=True) if offer.select_one('h2 a') else "Sin título",
         company=offer.select_one('p.company').get_text(strip=True) if offer.select_one('p.company') else "Sin empresa",
         region=offer.select_one('ul.location li').get_text(strip=True).split(', ')[1].strip() if offer.select_one('ul.location li') and ', ' in offer.select_one('ul.location li').get_text(strip=True) else "Sin región",
         city=offer.select_one('ul.location li').get_text(strip=True).split(', ')[0].strip() if offer.select_one('ul.location li') else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.select_one('div.desc').get_text(strip=True) if offer.select_one('div.desc') else "Sin descripción",
         experience="Sin experiencia",
         salary=offer.select_one('ul.salary li').get_text(strip=True) if offer.select_one('ul.salary li') else "Sin salario",
         date_posted=offer.select_one('span.badge-r.badge-s').get_text(strip=True).replace('Hace ', '') if offer.select_one('span.badge-r.badge-s') else "Sin fecha",
         time_since_posted=offer.select_one('span.badge-r.badge-s').get_text(strip=True).replace('Hace ', '') if offer.select_one('span.badge-r.badge-s') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('h2 a')['href']) if offer.select_one('h2 a') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Opcionempleo"
     )},
    {"name": "Reqlut", "url": "https://reqlut.com/trabajo/trabajos-en-chile?Search%5Bterms%5D=CHILE&page=1", "use_browser": True, "selector": ".job_offer_list.row", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2.fz16 span[itemprop="title"]').get_text(strip=True) if offer.select_one('h2.fz16 span[itemprop="title"]') else "Sin título",
         company=offer.select_one('span[itemprop="name"] a').get_text(strip=True) if offer.select_one('span[itemprop="name"] a') else "Sin empresa",
         region=offer.select_one('span[itemprop="addressRegion"]').get_text(strip=True).split(', ')[-1].replace(' Chile', '').strip() if offer.select_one('span[itemprop="addressRegion"]') else "Sin región",
         city=offer.select_one('span[itemprop="addressRegion"]').get_text(strip=True).split(', ')[1] if offer.select_one('span[itemprop="addressRegion"]') and len(offer.select_one('span[itemprop="addressRegion"]').get_text(strip=True).split(', ')) > 1 else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.select_one('meta[itemprop="description"]')['content'] if offer.select_one('meta[itemprop="description"]') else "Sin descripción",
         experience=offer.select_one('span[itemprop="experienceRequirements"]').get_text(strip=True) if offer.select_one('span[itemprop="experienceRequirements"]') else "Sin experiencia",
         salary=offer.select_one('meta[itemprop="baseSalary"]')['content'] if offer.select_one('meta[itemprop="baseSalary"]') else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted="Sin tiempo",
         link=urljoin(base_url, offer.select_one('h2 a')['href']) if offer.select_one('h2 a') else "Sin enlace",
         company_logo="https:" + offer.select_one('div.hidden-xs img')['src'] if offer.select_one('div.hidden-xs img') else "Sin logo",
         portal_logo="Sin logo",
         source="Reqlut"
     )},
    {"name": "Chiletrabajos", "url": "https://www.chiletrabajos.cl/encuentra-un-empleo", "use_browser": True, "selector": ".job-item.with-thumb.destacado.no-hover", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2.title a.font-weight-bold').get_text(strip=True) if offer.select_one('h2.title a.font-weight-bold') else "Sin título",
         company=offer.select_one('h3.meta').contents[0].strip().rstrip(',') if offer.select_one('h3.meta') and offer.select_one('h3.meta').contents else "Sin empresa",
         region=offer.select_one('h3.meta a[href*="ciudad"]').get_text(strip=True) if offer.select_one('h3.meta a[href*="ciudad"]') else "Sin región",
         city=offer.select_one('h3.meta a[href*="ciudad"]').get_text(strip=True) if offer.select_one('h3.meta a[href*="ciudad"]') else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.select_one('p.description').get_text(strip=True) if offer.select_one('p.description') else "Sin descripción",
         experience="Sin experiencia",
         salary="Sin salario",
         date_posted=offer.select_one('h3.meta a[href*="trabajo"]').get_text(strip=True).replace(' ', '') if offer.select_one('h3.meta a[href*="trabajo"]') else "Sin fecha",
         time_since_posted="Sin tiempo",
         link=urljoin(base_url, offer.select_one('h2.title a.font-weight-bold')['href']) if offer.select_one('h2.title a.font-weight-bold') else "Sin enlace",
         company_logo=re.search(r'url\((.*?)\)', offer.select_one('div.thumb')['style']).group(1) if offer.select_one('div.thumb') and 'url' in offer.select_one('div.thumb').get('style', '') else "Sin logo",
         portal_logo="Sin logo",
         source="Chiletrabajos"
     )},
    {"name": "Computrabajo", "url": "https://cl.computrabajo.com/trabajo-de-chile", "use_browser": True, "selector": "article.box_offer", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('.fs18.fwB.prB a.js-o-link.fc_base').get_text(strip=True) if offer.select_one('.fs18.fwB.prB a.js-o-link.fc_base') else "Sin título",
         company=offer.select_one('p.dFlex.vm_fx.fs16.fc_base.mt5 a.fc_base.t_ellipsis').get_text(strip=True) if offer.select_one('p.dFlex.vm_fx.fs16.fc_base.mt5 a.fc_base.t_ellipsis') else "Sin empresa",
         region=offer.select_one('.fs16.fc_base.mt5 span.mr10').get_text(strip=True).split(', ')[-1] if offer.select_one('.fs16.fc_base.mt5 span.mr10') else "Sin región",
         city=offer.select_one('.fs16.fc_base.mt5 span.mr10').get_text(strip=True).split(' - ')[0].split(', ')[0] if offer.select_one('.fs16.fc_base.mt5 span.mr10') else "Sin ciudad",
         comuna=offer.select_one('.fs16.fc_base.mt5 span.mr10').get_text(strip=True).split(' - ')[-1].split(', ')[0] if offer.select_one('.fs16.fc_base.mt5 span.mr10') and ' - ' in offer.select_one('.fs16.fc_base.mt5 span.mr10').get_text(strip=True) else "Sin comuna",
         country="Chile",
         description="Sin descripción",
         experience="Sin experiencia",
         salary=offer.select_one('div.fs13.mt15 span.dIB.mr10').get_text(strip=True) if offer.select_one('div.fs13.mt15 span.dIB.mr10') else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted=offer.select_one('p.fs13.fc_aux.mt15').get_text(strip=True) if offer.select_one('p.fs13.fc_aux.mt15') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('.fs18.fwB.prB a.js-o-link.fc_base')['href']) if offer.select_one('.fs18.fwB.prB a.js-o-link.fc_base') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Computrabajo"
     )},
    {"name": "Trovit", "url": "https://empleo.trovit.cl/trabajo-en-region-de-metropolitana-de-santiago", "use_browser": True, "selector": "#wrapper_listing li div.item.item-jobs", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h4 a.js-item-title').text.strip() if offer.select_one('h4 a.js-item-title') else "Sin título",
         company=offer.select_one('h5 span.company span').text.strip() if offer.select_one('h5 span.company span') else "Sin empresa",
         region=loc.split(', ')[1] if (loc := offer.select_one('h5 span.company-address span').text.strip() if offer.select_one('h5 span.company-address span') else "") and ', ' in loc else "Sin región",
         city=loc.split(', ')[0] if ', ' in loc else "Sin ciudad",
         comuna=offer.select_one('p.description').text.strip().split(', ')[0] if offer.select_one('p.description') and 'Las Condes' in offer.select_one('p.description').text else "Sin comuna",
         country="Chile",
         description=offer.select_one('p.description').text.strip().split('\\n')[0] if offer.select_one('p.description') else "Sin descripción",
         experience=re.search(r'(?i)(experiencia|junior|senior|de \d+ a \d+ años|\d+ años)', offer.get_text(strip=True)).group(0) if re.search(r'(?i)(experiencia|junior|senior|de \d+ a \d+ años|\d+ años)', offer.get_text(strip=True)) else "Sin experiencia",
         salary=match.group(1) if (match := re.search(r'(?i)bruto/año:\s*(\$[\d\.,]+)', offer.select_one('p.description').text if offer.select_one('p.description') else "")) else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted=offer.select('small')[-1].text.strip().split(' en ')[0] if offer.select('small') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('h4 a.js-item-title')['href']) if offer.select_one('h4 a.js-item-title') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Trovit"
     )},
    {"name": "Robert Half", "url": "https://www.roberthalf.com/cl/es/vacantes", "use_browser": True, "selector": "rhcl-job-card", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.get('headline', "Sin título"),
         company="Robert Half",
         region="Sin región",
         city=offer.get('location', "Sin ciudad"),
         comuna="Sin comuna",
         country="Chile",
         description=offer.get('copy', "Sin descripción"),
         experience="Sin experiencia",
         salary="Sin salario",
         date_posted=offer.get('date', '')[:10] if offer.get('date') else "Sin fecha",
         time_since_posted="Sin tiempo",
         link=offer.get('destination', "Sin enlace"),
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Robert Half"
     )},
    {"name": "Randstad", "url": "https://www.randstad.cl/trabajos/", "use_browser": True, "selector": "li.cards__item", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.find('h3', class_='cards__title').a.text.strip() if offer.find('h3', class_='cards__title') else "Sin título",
         company=re.search(r'(Importante empresa.+?)(se encuentra|busca|requiere|$)', offer.find('div', class_='cards__description').text, re.I).group(1).strip() if re.search(r'(Importante empresa.+?)(se encuentra|busca|requiere|$)', offer.find('div', class_='cards__description').text, re.I) else "Sin empresa",
         region=offer.find('ul', class_='cards__meta').find_all('li')[0].text.split(', ')[1].strip() if offer.find('ul', class_='cards__meta') and len(offer.find('ul', class_='cards__meta').find_all('li')[0].text.split(', ')) > 1 else "Sin región",
         city=offer.find('ul', class_='cards__meta').find_all('li')[0].text.split(', ')[0].strip() if offer.find('ul', class_='cards__meta') else "Sin ciudad",
         comuna=offer.find('ul', class_='cards__meta').find_all('li')[0].text.split(', ')[0].title().strip() if offer.find('ul', class_='cards__meta') else "Sin comuna",
         country="Chile",
         description=offer.find('div', class_='cards__description').text.strip() if offer.find('div', class_='cards__description') else "Sin descripción",
         experience="Sin experiencia",
         salary=offer.find('ul', class_='cards__meta').find_all('li')[2].text.strip() if offer.find('ul', class_='cards__meta') and len(offer.find('ul', class_='cards__meta').find_all('li')) > 2 else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted="Sin tiempo",
         link=urljoin(base_url, offer.find('h3', class_='cards__title').a['href']) if offer.find('h3', class_='cards__title') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Randstad"
     )},
    {"name": "UnMejorEmpleo", "url": "https://www.unmejorempleo.cl/empleos", "use_browser": True, "selector": "div.item-destacado, div.item-normal", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.find('a').get_text(strip=True) if offer.find('a') else "Sin título",
         company="Sin empresa",
         region="Sin región",
         city="Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.find_all('li')[1].get_text(strip=True) if len(offer.find_all('li')) > 1 else "Sin descripción",
         experience="Sin experiencia",
         salary="Sin salario",
         date_posted="Sin fecha",
         time_since_posted="Sin tiempo",
         link=urljoin(base_url, offer.find('a')['href']) if offer.find('a') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="UnMejorEmpleo"
     )},
    {"name": "Buscojobs", "url": "https://www.buscojobs.cl/", "use_browser": True, "selector": ".ListadoSimple_ofertas__t1m2y > .row", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('.ListadoSimple_cargo_oferta__AbkN0 > a').text.strip() if offer.select_one('.ListadoSimple_cargo_oferta__AbkN0 > a') else "Sin título",
         company=offer.select_one('.ListadoSimple_empresa_oferta__gBBOG > span').text.strip() if offer.select_one('.ListadoSimple_empresa_oferta__gBBOG > span') else "Sin empresa",
         region="Sin región",
         city=offer.select_one('.ListadoSimple_localidad_oferta__66xkX > span').text.strip() if offer.select_one('.ListadoSimple_localidad_oferta__66xkX > span') else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description="Sin descripción",
         experience="Sin experiencia",
         salary="Sin salario",
         date_posted="Sin fecha",
         time_since_posted=offer.select_one('.ListadoSimple_container_fecha_oferta__8T7iN > span').text.strip() if offer.select_one('.ListadoSimple_container_fecha_oferta__8T7iN > span') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('.ListadoSimple_cargo_oferta__AbkN0 > a')['href']) if offer.select_one('.ListadoSimple_cargo_oferta__AbkN0 > a') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Buscojobs"
     )},
    {"name": "Adecco", "url": "https://cl.computrabajo.com/adecco/empleos", "use_browser": True, "selector": "article.box_offer", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('.fs18.fwB.prB > a.fc_base').text.strip() if offer.select_one('.fs18.fwB.prB > a.fc_base') else "Sin título",
         company=offer.select_one('.fc_base.t_ellipsis').text.strip() if offer.select_one('.fc_base.t_ellipsis') else "Sin empresa",
         region=offer.select_one('.fs16.fc_base.mt5 > span.mr10').text.strip().split(', ')[-1] if offer.select_one('.fs16.fc_base.mt5 > span.mr10') else "Sin región",
         city=offer.select_one('.fs16.fc_base.mt5 > span.mr10').text.strip().split(', ')[0].split(' - ')[0] if offer.select_one('.fs16.fc_base.mt5 > span.mr10') else "Sin ciudad",
         comuna=offer.select_one('.fs16.fc_base.mt5 > span.mr10').text.strip().split(' - ')[-1].split(', ')[0] if offer.select_one('.fs16.fc_base.mt5 > span.mr10') and ' - ' in offer.select_one('.fs16.fc_base.mt5 > span.mr10').text.strip().split(', ')[0] else "Sin comuna",
         country="Chile",
         description="Sin descripción",
         experience="Sin experiencia",
         salary=offer.select_one('.fs13.mt15 > span.dIB.mr10').text.strip() if offer.select_one('.fs13.mt15 > span.dIB.mr10') else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted=offer.select_one('.fs13.fc_aux.mt15').text.strip() if offer.select_one('.fs13.fc_aux.mt15') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('.fs18.fwB.prB > a.fc_base')['href']) if offer.select_one('.fs18.fwB.prB > a.fc_base') else "Sin enlace",
         company_logo=offer.select_one('.logo_company > a > img')['src'] if offer.select_one('.logo_company > a > img') else "Sin logo",
         portal_logo="Sin logo",
         source="Adecco"
     )},
    {"name": "Laborum", "url": "https://www.laborum.cl/empleos.html", "use_browser": True, "selector": "div.sc-gAjsMU.bytxKG.sc-gkfylT.hvBpcU", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2.sc-hOcgrv.cvZmlm').text.strip() if offer.select_one('h2.sc-hOcgrv.cvZmlm') else "Sin título",
         company=offer.select_one('h3.sc-hOLYEO.fBYAwA').text.strip() if offer.select_one('h3.sc-hOLYEO.fBYAwA') else "Sin empresa",
         region=location.split(', ')[-1] if (location := offer.select_one('h3.sc-cOBeDT.kFaSGg').text.strip() if offer.select_one('h3.sc-cOBeDT.kFaSGg') else "") and ', ' in location else "Sin región",
         city=location.split(', ')[0] if ', ' in location else "Sin ciudad",
         comuna=location.split(', ')[0] if ', ' in location else "Sin comuna",
         country="Chile",
         description=offer.select_one('p.sc-bTOkCG.eVZILH').text.strip() if offer.select_one('p.sc-bTOkCG.eVZILH') else "Sin descripción",
         experience=re.search(r'(?i)(experiencia|junior|senior|de \d+ a \d+ años|\d+ años)', offer.select_one('p.sc-bTOkCG.eVZILH').text.strip() if offer.select_one('p.sc-bTOkCG.eVZILH') else "").group(0) if re.search(r'(?i)(experiencia|junior|senior|de \d+ a \d+ años|\d+ años)', offer.select_one('p.sc-bTOkCG.eVZILH').text.strip() if offer.select_one('p.sc-bTOkCG.eVZILH') else "") else "Sin experiencia",
         salary=match.group(1) if (match := re.search(r'Renta:\s*\$([\d.]+)', offer.select_one('p.sc-bTOkCG.eVZILH').text.strip() if offer.select_one('p.sc-bTOkCG.eVZILH') else "")) else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted=offer.select_one('h3.sc-fUQnTZ.frLxpA').text.strip() if offer.select_one('h3.sc-fUQnTZ.frLxpA') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('a.sc-ertOQY.hIChav')['href']) if offer.select_one('a.sc-ertOQY.hIChav') else "Sin enlace",
         company_logo=offer.select_one('img.sc-izUgoq.epxsPe')['src'] if offer.select_one('img.sc-izUgoq.epxsPe') else "Sin logo",
         portal_logo="Sin logo",
         source="Laborum"
     )},
    {"name": "Trabajando", "url": "https://www.trabajando.cl/trabajo-empleo/", "use_browser": True, "selector": "div.result-box-container > div.result-box", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2 > a').text.strip() if offer.select_one('h2 > a') else "Sin título",
         company=offer.select_one('span.type.d-block.fs-6').text.strip() if offer.select_one('span.type.d-block.fs-6') else "Sin empresa",
         region=location.split(', ')[-1] if (location := offer.select_one('span.location.d-block.fs-6').text.strip() if offer.select_one('span.location.d-block.fs-6') else "") and ', ' in location else "Sin región",
         city=location.split(', ')[0] if ', ' in location else "Sin ciudad",
         comuna=location.split(', ')[0] if ', ' in location else "Sin comuna",
         country="Chile",
         description=offer.select_one('p.description.mt-2.fs-6').text.strip() if offer.select_one('p.description.mt-2.fs-6') else "Sin descripción",
         experience="Sin experiencia",
         salary="Sin salario",
         date_posted="Sin fecha",
         time_since_posted=offer.select_one('span.date.mb-3.mb-md-0').text.strip() if offer.select_one('span.date.mb-3.mb-md-0') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('h2 > a')['href']) if offer.select_one('h2 > a') else "Sin enlace",
         company_logo=offer.select_one('div.image > img')['src'] if offer.select_one('div.image > img') else "Sin logo",
         portal_logo="Sin logo",
         source="Trabajando"
     )},
    {"name": "Jooble", "url": "https://cl.jooble.org/SearchResult", "use_browser": True, "selector": "ul.kiBEcn > li > div.n4WEb.rHG1ci", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2').text.strip() if offer.select_one('h2') else "Sin título",
         company=offer.select_one('div.company').text.strip() if offer.select_one('div.company') else "Sin empresa",
         region=location_text.split(', ')[1] if (location_text := offer.select_one('div.location').text.strip() if offer.select_one('div.location') else "") and ', ' in location_text and len(location_text.split(', ')) > 1 else "Sin región",
         city=location_text.split(', ')[0] if ', ' in location_text else "Sin ciudad",
         comuna=location_text.split(', ')[2] if len(location_text.split(', ')) > 2 else "Sin comuna",
         country="Chile",
         description=offer.select_one('div.description').text.strip() if offer.select_one('div.description') else "Sin descripción",
         experience=offer.select_one('div.experience').text.strip() if offer.select_one('div.experience') else re.search(r'(?i)(experiencia|junior|senior|de \d+ a \d+ años|\d+ años)', offer.get_text(strip=True)).group(0) if re.search(r'(?i)(experiencia|junior|senior|de \d+ a \d+ años|\d+ años)', offer.get_text(strip=True)) else "Sin experiencia",
         salary=offer.select_one('div.salary').text.strip() if offer.select_one('div.salary') else "Sin salario",
         date_posted=offer.select_one('div.date').text.strip() if offer.select_one('div.date') else "Sin fecha",
         time_since_posted=offer.select_one('div.date').text.strip() if offer.select_one('div.date') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('a')['href']) if offer.select_one('a') else "Sin enlace",
         company_logo=offer.select_one('div.logo img')['src'] if offer.select_one('div.logo img') else "Sin logo",
         portal_logo="Sin logo",
         source="Jooble"
     )},
    {"name": "Workana", "url": "https://www.workana.com/es/jobs?country=CL&language=es", "use_browser": True, "selector": "div.project-item.js-project", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2.h3.project-title a span')['title'] if offer.select_one('h2.h3.project-title a span') else "Sin título",
         company=offer.select_one('span.author-info.user-name a').text.strip() if offer.select_one('span.author-info.user-name a') else "Sin empresa",
         region="Sin región",
         city="Sin ciudad",
         comuna="Sin comuna",
         country=offer.select_one('span.country span.country-name a').text.strip() if offer.select_one('span.country span.country-name a') else "Chile",
         description=offer.select_one('div.html-desc.project-details div p span').text.strip() if offer.select_one('div.html-desc.project-details div p span') else "Sin descripción",
         experience="Sin experiencia",
         salary=offer.select_one('h4.budget span.values span').text.strip() if offer.select_one('h4.budget span.values span') else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted=offer.select_one('span.date').text.strip().split(': ')[-1] if offer.select_one('span.date') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('h2.h3.project-title a')['href']) if offer.select_one('h2.h3.project-title a') else "Sin enlace",
         company_logo=offer.select_one('span.author-avatar a span img')['src'] if offer.select_one('span.author-avatar a span img') else "Sin logo",
         portal_logo="Sin logo",
         source="Workana"
     )},
    {"name": "Michael Page", "url": "https://www.michaelpage.cl/jobs/chile/chile", "use_browser": True, "selector": "ul > li.views-row > div.job-tile.search-job-tile", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('div.job-title > h3 > a').text.strip() if offer.select_one('div.job-title > h3 > a') else "Sin título",
         company="Michael Page",
         region=location.split(' ')[-1] if (location := offer.select_one('div.job-properties > div.job-location').text.strip() if offer.select_one('div.job-properties > div.job-location') else "") and len(location.split(' ')) > 1 else "Sin región",
         city=location.split(' ')[0] if len(location.split(' ')) > 1 else location if location else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.select_one('div.job-summary > div.job_advert__job-summary-text > p').text.strip() if offer.select_one('div.job-summary > div.job_advert__job-summary-text > p') else "Sin descripción",
         experience=re.search(r'(?i)(experiencia|junior|senior|de \d+ a \d+ años|\d+ años)', offer.select_one('div.job-summary > div.job_advert__job-summary-text > p').text.strip() if offer.select_one('div.job-summary > div.job_advert__job-summary-text > p') else "").group(0) if re.search(r'(?i)(experiencia|junior|senior|de \d+ a \d+ años|\d+ años)', offer.select_one('div.job-summary > div.job_advert__job-summary-text > p').text.strip() if offer.select_one('div.job-summary > div.job_advert__job-summary-text > p') else "") else "Sin experiencia",
         salary=offer.select_one('div.job-properties > div.job-salary').text.strip() if offer.select_one('div.job-properties > div.job-salary') else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted="Sin tiempo",
         link=urljoin(base_url, offer.select_one('div.job-title > h3 > a')['href']) if offer.select_one('div.job-title > h3 > a') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Michael Page"
     )},
    {"name": "ManpowerChile", "url": "https://manpowerchile.zohorecruit.com/jobs/Manpowergroup", "use_browser": True, "selector": "div.cw-filter-joblist", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('div.cw-filter-joblist-left > h3 > a').text.strip() if offer.select_one('div.cw-filter-joblist-left > h3 > a') else "Sin título",
         company="ManpowerGroup",
         region=loc.split(', ')[1] if (loc := offer.select_one('p.filter-subhead.cw-bw').text.strip() if offer.select_one('p.filter-subhead.cw-bw') else "") and len(loc.split(', ')) > 1 else "Sin región",
         city=loc.split(', ')[0] if len(loc.split(', ')) > 1 else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.select_one('div.cw-filter-joblist-left > p.cw-bw').text.strip() if offer.select_one('div.cw-filter-joblist-left > p.cw-bw') else "Sin descripción",
         experience=offer.select_one('span.search-work-experience').text.strip() if offer.select_one('span.search-work-experience') else "Sin experiencia",
         salary="Sin salario",
         date_posted=offer.select_one('span.search-date-opened').text.strip() if offer.select_one('span.search-date-opened') else "Sin fecha",
         time_since_posted="Sin tiempo",
         link=urljoin(base_url, offer.select_one('div.cw-filter-joblist-left > h3 > a')['href']) if offer.select_one('div.cw-filter-joblist-left > h3 > a') else "Sin enlace",
         company_logo=offer.select_one('figure.logo > a > img')['src'] if offer.select_one('figure.logo > a > img') else "Sin logo",
         portal_logo="Sin logo",
         source="ManpowerChile"
     )},
    {"name": "Prácticas para Chile", "url": "https://www.practicasparachile.cl/convocatorias.html", "use_browser": True, "selector": "div.items > div.item", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('div.top > h4 > a').text.strip() if offer.select_one('div.top > h4 > a') else "Sin título",
         company=offer.select_one('div.top > p:not(.tipopractica)').text.strip() if offer.select_one('div.top > p:not(.tipopractica)') else "Sin empresa",
         region="Sin región",
         city=offer.select('div.cnt > p')[1].text.strip() if len(offer.select('div.cnt > p')) > 1 else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description="Sin descripción",
         experience="Sin experiencia",
         salary="Sin salario",
         date_posted="Sin fecha",
         time_since_posted="Sin tiempo",
         link=offer.select_one('div.top > h4 > a')['href'] if offer.select_one('div.top > h4 > a') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Prácticas para Chile"
     )},
    {"name": "Trabaja en el Estado", "url": "https://www.trabajaenelestado.cl/", "use_browser": True, "selector": "div.items > div.item", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('div.top > h4 > a').text.strip() if offer.select_one('div.top > h4 > a') else "Sin título",
         company=offer.select_one('div.top > p').text.strip() if offer.select_one('div.top > p') else "Sin empresa",
         region=offer.select('div.cnt > p')[1].text.strip().split(',')[1].strip() if len(offer.select('div.cnt > p')) > 1 else "Sin región",
         city=offer.select('div.cnt > p')[1].text.strip().split(',')[0].strip() if len(offer.select('div.cnt > p')) > 1 else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description="Sin descripción",
         experience="Sin experiencia",
         salary="Sin salario",
         date_posted="Sin fecha",
         time_since_posted="Sin tiempo",
         link=offer.select_one('div.top > h4 > a')['href'] if offer.select_one('div.top > h4 > a') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Trabaja en el Estado"
     )},
    {"name": "ADP Servicio Civil", "url": "https://adp.serviciocivil.cl/concursos-spl/opencms/portada.html", "use_browser": True, "selector": "div.owl-item > div.items", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('div.top > h4').text.strip() if offer.select_one('div.top > h4') else "Sin título",
         company=offer.select_one('div.top > p').text.strip() if offer.select_one('div.top > p') else "Sin empresa",
         region=offer.select('div.cnt > p')[0].text.strip() if len(offer.select('div.cnt > p')) > 0 else "Sin región",
         city="Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description="Sin descripción",
         experience="Sin experiencia",
         salary="Sin salario",
         date_posted="Sin fecha",
         time_since_posted="Sin tiempo",
         link=urljoin(base_url, offer.select_one('div.btn-end > a')['href']) if offer.select_one('div.btn-end > a') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo=offer.select_one('a.navbar-brand > img')['src'] if offer.select_one('a.navbar-brand > img') else "Sin logo",
         source="ADP Servicio Civil"
     )},
    {"name": "LinkedIn", "url": "https://cl.linkedin.com/jobs/oferta-de-trabajo-empleos?position=1&pageNum=0", "use_browser": True, "selector": "ul.jobs-search__results-list > li", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h3.base-search-card__title').text.strip() if offer.select_one('h3.base-search-card__title') else "Sin título",
         company=offer.select_one('h4.base-search-card__subtitle > a').text.strip() if offer.select_one('h4.base-search-card__subtitle > a') else "Sin empresa",
         region=loc.split(', ')[1] if (loc := offer.select_one('span.job-search-card__location').text.strip() if offer.select_one('span.job-search-card__location') else "") and len(loc.split(', ')) > 1 else "Sin región",
         city=loc.split(', ')[0] if len(loc.split(', ')) > 0 else "Sin ciudad",
         comuna="Sin comuna",
         country=loc.split(', ')[-1] if len(loc.split(', ')) > 1 else "Chile",
         description=offer.select_one('a.base-card__full-link > span.sr-only').text.strip() if offer.select_one('a.base-card__full-link > span.sr-only') else "Sin descripción",
         experience="Sin experiencia",
         salary="Sin salario",
         date_posted=offer.select_one('time.job-search-card__listdate')['datetime'] if offer.select_one('time.job-search-card__listdate') else "Sin fecha",
         time_since_posted=offer.select_one('time.job-search-card__listdate').text.strip() if offer.select_one('time.job-search-card__listdate') else "Sin tiempo",
         link=offer.select_one('a.base-card__full-link')['href'] if offer.select_one('a.base-card__full-link') else "Sin enlace",
         company_logo=offer.select_one('img.artdeco-entity-image')['src'] if offer.select_one('img.artdeco-entity-image') else "Sin logo",
         portal_logo="Sin logo",
         source="LinkedIn"
     )},
]