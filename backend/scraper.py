import asyncio
from aiohttp import ClientSession
import aiohttp
from datetime import datetime, timedelta
import os
import json
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re
from state import scrape_status, status_lock   # ← Importa desde state.py
# Imports necesarios
from utils import (
    logger,
    async_scrape_requests,
    scrape_with_playwright,
    validate_offer,
    get_proxy,
    get_user_agent,
    create_unified_job_offer
)

from db import upsert_job_batch, supabase

# ==================== ESTADO GLOBAL PARA DASHBOARD ====================
scrape_status = {}
status_lock = asyncio.Lock()
current_run_id = None

# ==================== LIMITES DE CONCURRENCIA ====================
PW_SEMAPHORE = asyncio.Semaphore(3)

# ==================== FRECUENCIA DINÁMICA POR PORTAL ====================
MAU_LEVELS = {
    'LinkedIn': 15, 'Computrabajo': 15, 'Laborum': 20, 'Buscojobs': 20,
    'Chiletrabajos': 30, 'Opcionempleo': 30, 'Adecco': 40, 'Trabajando': 40,
    'Jooble': 45, 'Reqlut': 60, 'Trovit': 60, 'UnMejorEmpleo': 60,
    'Robert Walters': 180, 'Robert Half': 180, 'Michael Page': 240,
    'ManpowerChile': 240, 'Randstad': 180, 'Workana': 120,
    'Prácticas para Chile': 240, 'Trabaja en el Estado': 180,
    'ADP Servicio Civil': 240,
}

# ==================== LISTA COMPLETA DE PORTALES ====================
portals = [ 
    {"name": "Robert Walters", "url": "https://www.robertwalters.cl/vacantes.html", "use_playwright": True, "selector": "div.search-result", "active": True,
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
     {"name": "Opcionempleo", "url": "https://www.opcionempleo.cl/trabajo?s=&l=Chile&start=0", "use_playwright": True, "selector": "article.job.clicky", "active": True,
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

    {"name": "Reqlut", "url": "https://reqlut.com/trabajo/trabajos-en-chile?Search%5Bterms%5D=CHILE&page=1", "use_playwright": True, "selector": ".job_offer_list.row", "active": True,
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

    {"name": "Chiletrabajos", "url": "https://www.chiletrabajos.cl/encuentra-un-empleo", "use_playwright": True, "selector": ".job-item.with-thumb.destacado.no-hover", "active": True,
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

    {"name": "Computrabajo", "url": "https://cl.computrabajo.com/trabajo-de-chile", "use_playwright": True, "selector": "article.box_offer", "active": True,
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

    {"name": "Trovit", "url": "https://empleo.trovit.cl/trabajo-en-region-de-metropolitana-de-santiago", "use_playwright": True, "selector": "#wrapper_listing li div.item.item-jobs", "active": True,
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

    {"name": "Robert Half", "url": "https://www.roberthalf.com/cl/es/vacantes", "use_playwright": True, "selector": "rhcl-job-card", "active": True,
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

    {"name": "Randstad", "url": "https://www.randstad.cl/trabajos/", "use_playwright": True, "selector": "li.cards__item", "active": True,
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

    {"name": "UnMejorEmpleo", "url": "https://www.unmejorempleo.cl/empleos", "use_playwright": True, "selector": "div.item-destacado, div.item-normal", "active": True,
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

    {"name": "Buscojobs", "url": "https://www.buscojobs.cl/", "use_playwright": False, "selector": ".ListadoSimple_ofertas__t1m2y > .row", "active": True,
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

    {"name": "Adecco", "url": "https://cl.computrabajo.com/adecco/empleos", "use_playwright": True, "selector": "article.box_offer", "active": True,
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

    {"name": "Laborum", "url": "https://www.laborum.cl/empleos.html", "use_playwright": True, "selector": "article[data-qa='job-card']", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2 a').get_text(strip=True) if offer.select_one('h2 a') else "Sin título",
         company=offer.select_one('div[data-qa="job-card-company"] span').get_text(strip=True) if offer.select_one('div[data-qa="job-card-company"] span') else "Sin empresa",
         region=loc.split(', ')[-1].strip() if (loc := offer.select_one('span[data-qa="job-card-location"]').get_text(strip=True) if offer.select_one('span[data-qa="job-card-location"]') else "") and ', ' in loc else "Sin región",
         city=loc.split(', ')[0].strip() if ', ' in loc else "Sin ciudad",
         comuna="Sin comuna",
         description=offer.select_one('div[data-qa="job-card-description"]').get_text(strip=True) if offer.select_one('div[data-qa="job-card-description"]') else "Sin descripción",
         salary=offer.select_one('span[data-qa="job-card-salary"]').get_text(strip=True) if offer.select_one('span[data-qa="job-card-salary"]') else "Sin salario",
         date_posted=offer.select_one('span[data-qa="job-card-published-date"]').get_text(strip=True) if offer.select_one('span[data-qa="job-card-published-date"]') else "Sin fecha",
         time_since_posted=offer.select_one('span[data-qa="job-card-published-date"]').get_text(strip=True) if offer.select_one('span[data-qa="job-card-published-date"]') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('a[data-qa="job-card-link"]')['href']) if offer.select_one('a[data-qa="job-card-link"]') else "Sin enlace",
         company_logo=offer.select_one('img[data-qa="job-card-company-logo"]')['src'] if offer.select_one('img[data-qa="job-card-company-logo"]') else "Sin logo",
         source="Laborum"
     )},

    {"name": "Trabajando", "url": "https://www.trabajando.cl/trabajo-empleo/", "use_playwright": True, "selector": "div.result-box-container > div.result-box", "active": True,
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

    {"name": "Jooble", "url": "https://cl.jooble.org/SearchResult", "use_playwright": True, "selector": "li.base-card", "active": True,
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

    {"name": "Workana", "url": "https://www.workana.com/es/jobs?country=CL&language=es", "use_playwright": True, "selector": "div.project-item.js-project", "active": True,
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

    {"name": "Michael Page", "url": "https://www.michaelpage.cl/jobs/chile/chile", "use_playwright": True, "selector": "ul > li.views-row > div.job-tile.search-job-tile", "active": True,
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

    {"name": "ManpowerChile", "url": "https://manpowerchile.zohorecruit.com/jobs/Manpowergroup", "use_playwright": True, "selector": "div.job-list-item", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h3 a').get_text(strip=True) if offer.select_one('h3 a') else "Sin título",
         company="ManpowerGroup",
         region=loc.split(', ')[-1].strip() if (loc := offer.select_one('p.location').get_text(strip=True) if offer.select_one('p.location') else "") and ', ' in loc else "Sin región",
         city=loc.split(', ')[0].strip() if ', ' in loc else "Sin ciudad",
         comuna="Sin comuna",
         description=offer.select_one('p.description').get_text(strip=True) if offer.select_one('p.description') else "Sin descripción",
         experience=offer.select_one('span.experience').get_text(strip=True) if offer.select_one('span.experience') else "Sin experiencia",
         salary="Sin salario",
         date_posted=offer.select_one('span.date').get_text(strip=True) if offer.select_one('span.date') else "Sin fecha",
         link=urljoin(base_url, offer.select_one('h3 a')['href']) if offer.select_one('h3 a') else "Sin enlace",
         company_logo=offer.select_one('img.logo')['src'] if offer.select_one('img.logo') else "Sin logo",
         source="ManpowerChile"
     )},

    {"name": "Prácticas para Chile", "url": "https://www.practicasparachile.cl/convocatorias.html", "use_playwright": True, "selector": "div.items > div.item", "active": True,
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

    {"name": "Trabaja en el Estado", "url": "https://www.trabajaenelestado.cl/", "use_playwright": True, "selector": "div.items > div.item", "active": True,
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

    {"name": "ADP Servicio Civil", "url": "https://adp.serviciocivil.cl/concursos-spl/opencms/portada.html", "use_playwright": True, "selector": "div.owl-item > div.items", "active": True,
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

    {"name": "LinkedIn", "url": "https://www.linkedin.com/jobs/search/?location=Chile&f_TPR=r604800", "use_playwright": True, "selector": "li.base-card", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h3.base-search-card__title').get_text(strip=True) if offer.select_one('h3.base-search-card__title') else "Sin título",
         company=offer.select_one('h4.base-search-card__subtitle a').get_text(strip=True) if offer.select_one('h4.base-search-card__subtitle a') else "Sin empresa",
         region=loc.split(', ')[-1].strip() if (loc := offer.select_one('span.job-search-card__location').get_text(strip=True) if offer.select_one('span.job-search-card__location') else "") and ', ' in loc else "Sin región",
         city=loc.split(', ')[0].strip() if ', ' in loc else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.select_one('div.base-card__full-link').get_text(strip=True) if offer.select_one('div.base-card__full-link') else "Sin descripción",
         experience="Sin experiencia",
         salary="Sin salario",
         date_posted=offer.select_one('time')['datetime'] if offer.select_one('time') else "Sin fecha",
         time_since_posted=offer.select_one('time').get_text(strip=True) if offer.select_one('time') else "Sin tiempo",
         link=offer.select_one('a.base-card__full-link')['href'] if offer.select_one('a.base-card__full-link') else "Sin enlace",
         company_logo=offer.select_one('img')['data-delayed-url'] if offer.select_one('img') else "Sin logo",
         source="LinkedIn"
     )},
]

def get_cache_key(portal_name):
    today = datetime.now().strftime('%Y-%m-%d')
    return os.path.join('cache', f"{portal_name}_{today}.json")

def should_scrape(portal_name):
    cache_file = get_cache_key(portal_name)
    if os.path.exists(cache_file):
        with open(cache_file, 'r') as f:
            cache = json.load(f)
            cache_time = datetime.fromisoformat(cache['timestamp'])
            expire = timedelta(minutes=MAU_LEVELS.get(portal_name, 60))
            if (datetime.now() - cache_time) < expire:
                logger.info(f"⏭️  {portal_name} skipped (cache fresco)")
                return False
    return True

async def log_portal(name: str, message: str, emoji: str = "🔄"):
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{timestamp} {emoji} [{name}] {message}")
    async with status_lock:
        if name not in scrape_status:
            scrape_status[name] = {}
        scrape_status[name].update({
            "last_log": f"{timestamp} {message}",
            "last_updated": datetime.now().isoformat()
        })

async def scrape_portal(portal, session):
    name = portal['name']
    async with status_lock:
        scrape_status[name] = {"state": "starting", "jobs_saved": 0, "duration": 0, "error": None}

    if not should_scrape(name):
        await log_portal(name, "skipped (cache fresco)", "⏭️")
        async with status_lock:
            scrape_status[name]["state"] = "skipped"
        return name, 0, 0

    await log_portal(name, f"Iniciando usando {'Playwright' if portal.get('use_playwright') else 'Requests'}...", "🔄")
    async with status_lock:
        scrape_status[name]["state"] = "running"

    start_time = time.time()
    max_offers = 20
    saved = 0

    try:
        async with PW_SEMAPHORE if portal.get('use_playwright') else asyncio.nullcontext():
            if portal.get('use_playwright'):
                offers, diag = await scrape_with_playwright(
                    portal['url'], portal.get('selector'), portal.get('extract_func'),
                    portal_name=name, max_offers=max_offers
                )
            else:
                headers = {"User-Agent": get_user_agent()}
                proxy = get_proxy()
                offers, diag = await async_scrape_requests(
                    session, portal['url'], headers, proxy,
                    portal.get('selector'), portal.get('extract_func'),
                    max_offers=max_offers, portal_name=name
                )

            # Early stopping + validación
            valid_offers = []
            duplicates_in_row = 0
            for offer in offers:
                if isinstance(offer, dict):  # ya es un job dict (de cache o scrape anterior)
                    job = offer
                else:
                    job = portal['extract_func'](offer, portal['url']) if portal.get('extract_func') else create_unified_job_offer(source=name)

                if validate_offer(job):
                    valid_offers.append(job)
                    if len(valid_offers) % 5 == 0:
                        existing = supabase.table('job_offers').select('id').eq('link', job['link']).execute()
                        if existing.data:
                            duplicates_in_row += 1
                            if duplicates_in_row >= 3:
                                await log_portal(name, "Early Stopping activado", "✅")
                                break
                        else:
                            duplicates_in_row = 0

            if valid_offers and upsert_job_batch(valid_offers):
                saved = len(valid_offers)

        duration = int(time.time() - start_time)
        await log_portal(name, f"terminado: {saved} jobs guardados en {duration}s", "✅")

        async with status_lock:
            scrape_status[name].update({
                "state": "success",
                "jobs_saved": saved,
                "duration": duration,
                "success_rate": round(len(valid_offers)/max_offers*100, 1) if valid_offers else 0
            })
        return name, saved, duration

    except Exception as e:
        await log_portal(name, f"FALLÓ: {str(e)[:100]}", "❌")
        async with status_lock:
            scrape_status[name].update({"state": "error", "error": str(e)[:200]})
        return name, 0, 0

async def main():
    global current_run_id
    current_run_id = datetime.now().isoformat()
    await log_portal("GLOBAL", "Iniciando Scrape HoundJob completo...", "🚀")

    # FASE 1: Requests
    requests_portals = [p for p in portals if p.get('active') and not p.get('use_playwright')]
    async with ClientSession(connector=aiohttp.TCPConnector(limit=10)) as session:
        tasks = [scrape_portal(p, session) for p in requests_portals]
        await asyncio.gather(*tasks)

    # FASE 2: Playwright
    pw_portals = [p for p in portals if p.get('active') and p.get('use_playwright')]
    async with ClientSession(connector=aiohttp.TCPConnector(limit=4)) as session:
        tasks = [scrape_portal(p, session) for p in pw_portals]
        await asyncio.gather(*tasks)

    total_jobs = sum(s.get('jobs_saved', 0) for s in scrape_status.values())
    await log_portal("GLOBAL", f"Scrape COMPLETO → {total_jobs} jobs guardados", "🎉")

if __name__ == "__main__":
    asyncio.run(main())