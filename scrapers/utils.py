# utils.py

import os
import time
import logging
import random
import json
from datetime import datetime, timedelta
import aiohttp
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
import asyncio
from playwright.async_api import async_playwright
import requests
import warnings
import re
import dateparser
try:
    from twocaptcha import TwoCaptcha
except ImportError:
    TwoCaptcha = None
warnings.filterwarnings('ignore', category=requests.packages.urllib3.exceptions.InsecureRequestWarning)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
PROXIES = [  # Updated with fresh proxies (validated via tool/search)
    'http://190.152.19.190:80',
    'http://200.73.128.57:3128',
    'http://190.152.5.126:80',
    'http://45.228.147.239:999',
    'http://190.82.93.158:80',
    'http://45.71.184.107:999',
    'http://190.110.99.130:80',
    'http://190.103.177.131:80',
    'http://190.152.19.190:80',  # Duplicate for fallback
]
TWOCAPTCHA_API_KEY = 'cc875ff052fdbefd3690657d89e92c05'
JOOBLE_API_KEY = os.getenv('JOOBLE_API_KEY', None)
CACHE_DIR = 'cache'
os.makedirs(CACHE_DIR, exist_ok=True)

def get_cache_key(portal_name):
    today = datetime.now().strftime('%Y-%m-%d')
    return os.path.join(CACHE_DIR, f"{portal_name}_{today}.json")

def load_cache(portal_name):
    cache_file = get_cache_key(portal_name)
    if os.path.exists(cache_file):
        with open(cache_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            cache_time = datetime.fromisoformat(data.get('timestamp', datetime.now().isoformat()))
            if (datetime.now() - cache_time) < timedelta(days=3):
                return data.get('offers', [])
    return None

def save_cache(portal_name, data):
    cache_file = get_cache_key(portal_name)
    cache_data = {'offers': data, 'timestamp': datetime.now().isoformat()}
    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(cache_data, f, ensure_ascii=False, indent=4)

def validate_proxy(proxy, test_url="https://www.google.com", timeout=5):
    try:
        response = requests.get(test_url, proxies={"http": proxy, "https": proxy}, timeout=timeout, verify=False)
        logger.info(f"Validando proxy {proxy}: {response.status_code}")
        return response.status_code == 200
    except:
        return False

VALID_PROXIES = [p for p in PROXIES if validate_proxy(p)]

def get_proxy():
    return random.choice(VALID_PROXIES) if VALID_PROXIES else None

def get_user_agent():
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    ]
    return random.choice(user_agents)

def create_unified_job_offer(**kwargs):
    default_fields = {
        "title": "No disponible", "company": "No disponible", "region": "No disponible", "city": "No disponible",
        "comuna": "No disponible", "country": "Chile", "description": "No disponible", "experience": "Sin experiencia",
        "salary": "No disponible", "date_posted": "No disponible", "time_since_posted": "No disponible",
        "link": "No disponible", "company_logo": "Sin logo", "portal_logo": "Sin logo", "source": "No disponible",
    }
    default_fields.update(kwargs)
    return default_fields

def validate_offer(offer):
    required_fields = ['title', 'city']
    return all(offer[field] != "No disponible" and offer[field] != "Sin " + field and offer[field] != "" for field in required_fields)

def is_valid_link(link, portal_url):
    invalid_patterns = ['login', 'contactanos', 'contact', 'signup', 'register', 'trabajar-en']
    return link != "Sin enlace" and not any(pattern in link.lower() for pattern in invalid_patterns) and portal_url in link

async def scrape_jooble_api(api_key, keywords="CHILE", location="Chile", max_offers=3):
    if not api_key:
        return [], {"success": False, "message": "No API key provided"}
    url = f"https://jooble.org/api/{api_key}"
    payload = {
        "keywords": keywords,
        "location": location,
        "radius": "80",
        "page": "1",
        "jobType": "all",
        "companysearch": "false"
    }
    headers = {"Content-Type": "application/json"}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status != 200:
                    return [], {"success": False, "message": f"API error: {response.status}"}
                data = await response.json()
                jobs = data.get('jobs', [])[:max_offers]
                job_offers = []
                for jb in jobs:
                    unified = create_unified_job_offer(
                        title=jb.get('title', 'No disponible'),
                        company=jb.get('company', 'No disponible'),
                        region=jb.get('location', 'No disponible').split(', ')[1] if ', ' in jb.get('location') else "Sin región",
                        city=jb.get('location', 'No disponible').split(', ')[0] if ', ' in jb.get('location') else "Sin ciudad",
                        comuna="Sin comuna",
                        description=jb.get('snippet', 'No disponible'),
                        salary=jb.get('salary', 'No disponible'),
                        date_posted=jb.get('updated', 'No disponible'),
                        link=jb.get('link', 'No disponible'),
                        source="Jooble API"
                    )
                    job_offers.append(unified)
                valid_offers = [j for j in job_offers if validate_offer(j)]
                return valid_offers, {"success": bool(valid_offers), "message": "API éxito", "time_taken": 0}
    except Exception as e:
        return [], {"success": False, "message": str(e)}

async def async_scrape_requests(session, url, headers, proxy, selector, extract_func, max_offers=3, portal_name=""):
    for attempt in range(3): # Retries
        try:
            timeout = aiohttp.ClientTimeout(total=20) # Aumentado
            async with session.get(url, headers=headers, proxy=proxy, timeout=timeout, ssl=False) as response:
                if response.status != 200:
                    return [], {"success": False, "message": f"HTTP {response.status}"}
                text = await response.text()
                soup = BeautifulSoup(text, 'html.parser')
            offers = soup.select(selector) if selector else []
            if not offers:
                offers = ([elem for elem in soup.find_all('div', class_ = lambda x: x and ('job' in str(x).lower() or 'oferta' in str(x).lower() or 'vacancy' in str(x).lower() or 'listing' in str(x).lower() or 'item' in str(x).lower() or 'project' in str(x).lower() or 'result' in str(x).lower())) if elem] or
                         [elem for elem in soup.find_all('article') if elem] or
                         [elem for elem in soup.find_all('li') if elem])
            job_offers = []
            for offer in offers[:max_offers]:
                try:
                    job = extract_func(offer, url) if extract_func else create_unified_job_offer(source="Unknown")
                except Exception as e:
                    logger.warning(f"Error en extract_func para {portal_name}: {str(e)}")
                    job = create_unified_job_offer(source=portal_name) # Fallback
                # Limpieza genérica
                for field in ['title', 'company', 'location', 'salary', 'date_posted', 'description']:
                    elem = offer.find(['h1', 'h2', 'h3', 'span', 'div', 'p'], string=lambda t: t and field in t.lower()) or offer.find(['h1', 'h2', 'h3', 'span', 'div', 'p'], class_=lambda x: x and field in x.lower())
                    if elem:
                        job[field] = elem.get_text(strip=True).replace('Ninguno', '').strip() or job[field]
                if not job['link'] or 'No disponible' in job['link'] or not is_valid_link(job['link'], url):
                    link_elem = offer.find('a', href=True)
                    if link_elem:
                        href = link_elem['href']
                        job['link'] = urljoin(url, href) if href.startswith('/') else href if href.startswith('http') and is_valid_link(href, url) else "Sin enlace"
                job_offers.append(job)
            valid_offers = [j for j in job_offers if validate_offer(j)]
            return valid_offers, {"success": bool(valid_offers), "message": "Requests éxito"}
        except Exception as e:
            if attempt == 2:
                return [], {"success": False, "message": str(e)}

async def scrape_with_playwright(url, selector, extract_func, use_proxy=True, portal_name="", max_offers=3, max_pages=5):
    for attempt in range(3):
        try:
            start_time = time.time()
            proxy = get_proxy() if use_proxy else None
            user_agent = get_user_agent()
            headers = {
                "Accept-Language": "es-CL,es;q=0.8,en-US;q=0.5,en;q=0.3",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Dest": "document",
                "Upgrade-Insecure-Requests": "1",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Referer": "https://www.google.com/"
            }
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True, args=[
                    '--no-sandbox', '--disable-setuid-sandbox', '--disable-images',
                    '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1920,1080',
                    '--disable-blink-features=AutomationControlled'
                ])
                context_kwargs = {
                    "user_agent": user_agent,
                    "viewport": {"width": 1920, "height": 1080},
                    "extra_http_headers": headers
                }
                if proxy:
                    context_kwargs["proxy"] = {"server": proxy}
                context = await browser.new_context(**context_kwargs)
                page = await context.new_page()
                await page.goto(url, wait_until='domcontentloaded', timeout=60000)
                await asyncio.sleep(random.uniform(1, 2))
                # Cookies
                cookie_selectors = [
                    '#onetrust-accept-btn-handler', '#cookiescript_accept', '#cookies-accept',
                    'button[aria-label="Aceptar todo"]', '.ot-sdk-btn.accept-btn-handler',
                    '[data-cs-i18n-text*="Aceptar todo"]'
                ]
                for sel in cookie_selectors:
                    try:
                        await page.wait_for_selector(sel, timeout=5000)
                        await page.click(sel)
                        await asyncio.sleep(0.5)
                    except:
                        pass
                # CAPTCHA
                content = await page.content()
                if "captcha" in content.lower() or "un momento" in content.lower():
                    if TwoCaptcha:
                        solver = TwoCaptcha(TWOCAPTCHA_API_KEY)
                        site_key = await page.evaluate("() => document.querySelector('[data-sitekey]')?.getAttribute('data-sitekey')")
                        if site_key:
                            result = solver.recaptcha(sitekey=site_key, url=page.url)
                            code = result['code']
                            await page.evaluate(f"document.getElementById('g-recaptcha-response').innerHTML = '{code}';")
                            try:
                                await page.click('button[type="submit"], input[type="submit"]')
                            except:
                                await page.evaluate("document.querySelector('form').submit()")
                            await asyncio.sleep(5)
                            content = await page.content()
                # Scroll extendido para infinite scroll
                previous_height = await page.evaluate('document.body.scrollHeight')
                while True:
                    await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
                    await asyncio.sleep(random.uniform(2, 3))
                    new_height = await page.evaluate('document.body.scrollHeight')
                    if new_height == previous_height:
                        break
                    previous_height = new_height
                soup = BeautifulSoup(await page.content(), 'html.parser')
                offers = soup.select(selector) if selector else []
                if not offers:
                    offers = ([elem for elem in soup.find_all('div', class_=lambda x: x and ('job' in str(x).lower() or 'oferta' in str(x).lower() or 'vacancy' in str(x).lower() or 'listing' in str(x).lower() or 'item' in str(x).lower() or 'project' in str(x).lower() or 'result' in str(x).lower())) if elem] or
                             [elem for elem in soup.find_all('article') if elem] or
                             [elem for elem in soup.find_all('li') if elem])
                job_offers = []
                for offer in offers[:max_offers]:
                    try:
                        job = extract_func(offer, url) if extract_func else create_unified_job_offer(source=portal_name)
                    except Exception as e:
                        logger.warning(f"Error en extract_func para {portal_name}: {str(e)}")
                        job = create_unified_job_offer(source=portal_name) # Fallback
                    # Limpieza genérica
                    for field in ['title', 'company', 'location', 'salary', 'date_posted', 'description']:
                        elem = offer.find(['h1', 'h2', 'h3', 'span', 'div', 'p'], string=lambda t: t and field in t.lower()) or offer.find(['h1', 'h2', 'h3', 'span', 'div', 'p'], class_=lambda x: x and field in x.lower())
                        if elem:
                            job[field] = elem.get_text(strip=True).replace('Ninguno', '').strip() or job[field]
                    if not job['link'] or 'No disponible' in job['link'] or not is_valid_link(job['link'], url):
                        link_elem = offer.find('a', href=True)
                        if link_elem:
                            href = link_elem['href']
                            job['link'] = urljoin(url, href) if href.startswith('/') else href if href.startswith('http') and is_valid_link(href, url) else "Sin enlace"
                    job_offers.append(job)
                valid_offers = [j for j in job_offers if validate_offer(j)]
                time_taken = time.time() - start_time
                diag = {"success": bool(valid_offers), "message": "Playwright success" if valid_offers else "No valid offers", "proxy_used": proxy or "None", "time_taken": time_taken}
                await browser.close()
                return valid_offers, diag
        except Exception as e:
            if attempt == 2:
                return [], {"success": False, "message": str(e)}

# Portales actualizados con extract_func corregidos y robustos
portals = [
    {"name": "Robert Walters", "url": "https://www.robertwalters.cl/vacantes.html", "use_browser": True, "selector": "div.search-result", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('.search-result-title h3 a').text.strip() if offer.select_one('.search-result-title h3 a') else "Sin título",
         company="Robert Walters",
         region=offer.select_one('p.result-attrib:has(span.attribute-label:contains("Ubicación:")) span.attribute-value').text.strip().split()[0] if offer.select_one('p.result-attrib:has(span.attribute-label:contains("Ubicación:"))') else "Sin región",
         city=offer.select_one('p.result-attrib:has(span.attribute-label:contains("Ubicación:")) span.attribute-value').text.strip() if offer.select_one('p.result-attrib:has(span.attribute-label:contains("Ubicación:"))') else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.select_one('.search-result-description').text.strip() if offer.select_one('.search-result-description') else "Sin descripción",
         experience=re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.select_one('.search-result-description').text.strip()).group(0) if offer.select_one('.search-result-description') and re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.select_one('.search-result-description').text.strip()) else "Sin experiencia",
         salary=offer.select_one('p.result-attrib:has(span.attribute-label:contains("Salario:")) span.attribute-value').text.strip() if offer.select_one('p.result-attrib:has(span.attribute-label:contains("Salario:"))') else "Sin salario",
         date_posted=offer.select_one('p.result-attrib:has(span.attribute-label:contains("Fecha de publicación:")) span.attribute-value').text.strip() if offer.select_one('p.result-attrib:has(span.attribute-label:contains("Fecha de publicación:"))') else "Sin fecha",
         time_since_posted=(lambda dp: (lambda months={'enero':1, 'febrero':2, 'marzo':3, 'abril':4, 'mayo':5, 'junio':6, 'julio':7, 'agosto':8, 'septiembre':9, 'octubre':10, 'noviembre':11, 'diciembre':12}: f"{(datetime.now() - datetime(int(year), months[month.lower()], int(day))).days} días" if (parts := dp.split()) and len(parts)==5 and (month:=parts[2]) in months and (day:=parts[0]) and (year:=parts[4]) else "Sin tiempo")() if dp != "Sin fecha" else "Sin tiempo"),
         link=urljoin(base_url, offer.select_one('.search-result-title h3 a')['href']) if offer.select_one('.search-result-title h3 a') else "Sin enlace",
         company_logo=offer.select_one('.search-result-logo img')['src'] if offer.select_one('.search-result-logo img') else "Sin logo",
         portal_logo="Sin logo",
         source="Robert Walters"
     )},
    {"name": "Opcionempleo", "url": "https://www.opcionempleo.cl/trabajo?s=&l=Chile&start=0", "use_browser": True, "selector": "article.job.clicky", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2 a').text.strip() if offer.select_one('h2 a') else "Sin título",
         company=offer.select_one('p.company').text.strip() if offer.select_one('p.company') else "Sin empresa",
         region=offer.select_one('ul.location li').text.strip().split(', ')[1] if offer.select_one('ul.location li') and len(offer.select_one('ul.location li').text.strip().split(', ')) > 1 else "Sin región",
         city=offer.select_one('ul.location li').text.strip().split(', ')[0] if offer.select_one('ul.location li') else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.select_one('div.desc').text.strip() if offer.select_one('div.desc') else "Sin descripción",
         experience=re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.get_text(strip=True)).group(0) if re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.get_text(strip=True)) else "Sin experiencia",
         salary=offer.select_one('ul.salary li').text.strip() if offer.select_one('ul.salary li') else "Sin salario",
         date_posted=offer.select_one('span.badge-r.badge-s').text.strip().replace('Hace ', '') if offer.select_one('span.badge-r.badge-s') else "Sin fecha",
         time_since_posted=offer.select_one('span.badge-r.badge-s').text.strip().replace('Hace ', '') if offer.select_one('span.badge-r.badge-s') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('h2 a')['href']) if offer.select_one('h2 a') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Opcionempleo"
     )},
    {"name": "Reqlut", "url": "https://reqlut.com/trabajo/trabajos-en-chile?Search%5Bterms%5D=CHILE&page=1", "use_browser": True, "selector": ".job_offer_list.row", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2.fz16 span[itemprop="title"]').text.strip() if offer.select_one('h2.fz16 span[itemprop="title"]') else "Sin título",
         company=offer.select_one('span[itemprop="name"] a').text.strip() if offer.select_one('span[itemprop="name"] a') else "Sin empresa",
         region=offer.select_one('span[itemprop="addressRegion"]').text.strip().split(', ')[2].replace(' Chile', '') if offer.select_one('span[itemprop="addressRegion"]') and len(offer.select_one('span[itemprop="addressRegion"]').text.strip().split(', ')) > 2 else "Sin región",
         city=offer.select_one('span[itemprop="addressRegion"]').text.strip().split(', ')[1] if offer.select_one('span[itemprop="addressRegion"]') and len(offer.select_one('span[itemprop="addressRegion"]').text.strip().split(', ')) > 1 else "Sin ciudad",
         comuna=offer.select_one('meta[itemprop="addressLocality"]')['content'].split('; ')[1].split(', ')[0] if offer.select_one('meta[itemprop="addressLocality"]') else "Sin comuna",
         country="Chile",
         description=offer.select_one('meta[itemprop="description"]')['content'] if offer.select_one('meta[itemprop="description"]') else "Sin descripción",
         experience=offer.select_one('span[itemprop="experienceRequirements"]').text.strip() if offer.select_one('span[itemprop="experienceRequirements"]') else "Sin experiencia",
         salary=offer.select_one('meta[itemprop="baseSalary"]')['content'] if offer.select_one('meta[itemprop="baseSalary"]') else "Sin salario",
         date_posted=offer.select_one('p.date').text.strip() if offer.select_one('p.date') else "Sin fecha",
         time_since_posted=(lambda dp: f"{(datetime.now() - dateparser.parse(dp)).days} días" if dp != "Sin fecha" else "Sin tiempo")(),
         link=urljoin(base_url, offer.select_one('h2 a')['href']) if offer.select_one('h2 a') else "Sin enlace",
         company_logo="https:" + offer.select_one('div.hidden-xs img')['src'] if offer.select_one('div.hidden-xs img') else "Sin logo",
         portal_logo="Sin logo",
         source="Reqlut"
     )},
    {"name": "Chiletrabajos", "url": "https://www.chiletrabajos.cl/encuentra-un-empleo", "use_browser": True, "selector": ".job-item.with-thumb.destacado.no-hover", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2.title a.font-weight-bold').text.strip() if offer.select_one('h2.title a.font-weight-bold') else "Sin título",
         company=offer.select_one('h3.meta').contents[0].strip().rstrip(',') if offer.select_one('h3.meta') else "Sin empresa",
         region=offer.select_one('h3.meta a[href*="ciudad"]').text.strip() if offer.select_one('h3.meta a[href*="ciudad"]') else "Sin región",
         city=offer.select_one('h3.meta a[href*="ciudad"]').text.strip() if offer.select_one('h3.meta a[href*="ciudad"]') else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.select_one('p.description').text.strip() if offer.select_one('p.description') else "Sin descripción",
         experience=re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años|requeridos|mínima|equivalente)', offer.get_text(strip=True)).group(0) if re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años|requeridos|mínima|equivalente)', offer.get_text(strip=True)) else "Sin experiencia",
         salary=offer.find(string=re.compile(r'(salario|sueldo|$|negociable)', re.I)).get_text(strip=True) if offer.find(string=re.compile(r'(salario|sueldo|$|negociable)', re.I)) else "Sin salario",
         date_posted=offer.select_one('h3.meta a[href*="trabajo"]').text.replace(' ', '').strip() if offer.select_one('h3.meta a[href*="trabajo"]') else "Sin fecha",
         time_since_posted=str((datetime.now() - dateparser.parse(offer.select_one('h3.meta a[href*="trabajo"]').text.replace(' ', '').strip())).days) + " días" if offer.select_one('h3.meta a[href*="trabajo"]') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('h2.title a.font-weight-bold')['href']) if offer.select_one('h2.title a.font-weight-bold') else "Sin enlace",
         company_logo=re.search(r'url\((.*?)\)', offer.select_one('div.thumb')['style']).group(1) if offer.select_one('div.thumb') and 'url' in offer.select_one('div.thumb')['style'] else "Sin logo",
         portal_logo="Sin logo",
         source="Chiletrabajos"
     )},
    {"name": "Computrabajo", "url": "https://cl.computrabajo.com/trabajo-de-chile", "use_browser": True, "selector": "article.box_offer", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2.fs18.fwB.prB a.js-o-link.fc_base').text.strip() if offer.select_one('h2.fs18.fwB.prB a.js-o-link.fc_base') else "Sin título",
         company=offer.select_one('p.dFlex.vm_fx.fs16.fc_base.mt5 a.fc_base.t_ellipsis').text.strip() if offer.select_one('p.dFlex.vm_fx.fs16.fc_base.mt5 a.fc_base.t_ellipsis') else "Sin empresa",
         region=offer.select_one('p.fs16.fc_base.mt5 span.mr10').text.strip().split(', ')[1] if offer.select_one('p.fs16.fc_base.mt5 span.mr10') and ', ' in offer.select_one('p.fs16.fc_base.mt5 span.mr10').text else "Sin región",
         city=offer.select_one('p.fs16.fc_base.mt5 span.mr10').text.strip().split(' - ')[0] if offer.select_one('p.fs16.fc_base.mt5 span.mr10') and ' - ' in offer.select_one('p.fs16.fc_base.mt5 span.mr10').text else "Sin ciudad",
         comuna=offer.select_one('p.fs16.fc_base.mt5 span.mr10').text.strip().split(' - ')[1].split(', ')[0] if offer.select_one('p.fs16.fc_base.mt5 span.mr10') and ' - ' in offer.select_one('p.fs16.fc_base.mt5 span.mr10').text else "Sin comuna",
         country="Chile",
         description="Sin descripción",
         experience="Sin experiencia",
         salary=offer.select_one('div.fs13.mt15 span.dIB.mr10').text.strip() if offer.select_one('div.fs13.mt15 span.dIB.mr10') else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted=offer.select_one('p.fs13.fc_aux.mt15').text.strip() if offer.select_one('p.fs13.fc_aux.mt15') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('h2.fs18.fwB.prB a.js-o-link.fc_base')['href']) if offer.select_one('h2.fs18.fwB.prB a.js-o-link.fc_base') else "Sin enlace",
         company_logo="<https://ii.ct-stc.com/4/logos/empresas/2023/05/25/06b73acece914e278be6222345771thumbnail.png>",
         portal_logo="Sin logo",
         source="Computrabajo"
     )},
    {"name": "Trovit", "url": "https://empleo.trovit.cl/trabajo-en-region-de-metropolitana-de-santiago", "use_browser": True, "selector": "#wrapper_listing li div.item.item-jobs", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h4 a.js-item-title').text.strip() if offer.select_one('h4 a.js-item-title') else "Sin título",
         company=offer.select_one('h5 span.company span').text.strip() if offer.select_one('h5 span.company span') else "Sin empresa",
         region=loc.split(', ')[1] if (loc := offer.select_one('h5 span.company-address span').text.strip() if offer.select_one('h5 span.company-address span') else "") and ', ' in loc else "Sin región",
         city=loc.split(', ')[0] if ', ' in loc else "Sin ciudad",
         comuna=offer.select_one('p.description').text.strip().split(', ')[0] if 'Las Condes' in offer.select_one('p.description').text else "Sin comuna",
         country="Chile",
         description=offer.select_one('p.description').text.strip().split('\\n')[0] if offer.select_one('p.description') else "Sin descripción",
         experience=re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.get_text(strip=True)).group(0) if re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.get_text(strip=True)) else "Sin experiencia",
         salary=match.group(1) if (match := re.search(r'(?i)bruto/año:\\s*(\\$[\\d\\.,]+)', offer.select_one('p.description').text if offer.select_one('p.description') else "")) else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted=offer.select('small')[-1].text.strip().split(' en ')[0] if offer.select('small') else "Sin tiempo",
         link=urljoin(base_url, offer.select_one('h4 a.js-item-title')['href']) if offer.select_one('h4 a.js-item-title') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Trovit"
     )},
    {"name": "Robert Half", "url": "https://www.roberthalf.com/cl/es/vacantes", "use_browser": True, "selector": "rhcl-job-card", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.get('headline') if 'headline' in offer.attrs else "Sin título",
         company=re.search(r'Empresa\\s*(.+?)(,|\\.|$)', offer.get('copy'), re.I).group(1).strip() if 'copy' in offer.attrs and re.search(r'Empresa\\s*(.+?)(,|\\.|$)', offer.get('copy'), re.I) else "Robert Half",
         region=loc.split(' ')[-1] if (loc := offer.get('location', "")) and len(loc.split(' ')) > 1 else "Sin región",
         city=loc.split(' ')[0] if len(loc.split(' ')) > 1 else loc if loc else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.get('copy') if 'copy' in offer.attrs else "Sin descripción",
         experience=re.search(r'(\\d+\\s*años\\s*de\\s*experiencia)', offer.get('copy'), re.I).group(0) if 'copy' in offer.attrs and re.search(r'(\\d+\\s*años\\s*de\\s*experiencia)', offer.get('copy'), re.I) else "Sin experiencia",
         salary=f"{offer.get('salary-min', '0')} - {offer.get('salary-max', '0')} {offer.get('salary-currency', 'CLP')} / {offer.get('salary-period', 'Yearly')}" if 'salary-min' in offer.attrs or 'salary-max' in offer.attrs else "Sin salario",
         date_posted=offer.get('date')[:10] if 'date' in offer.attrs else "Sin fecha",
         time_since_posted=str((datetime.now() - datetime.fromisoformat(offer.get('date').replace('Z', '+00:00'))).days) + " días" if 'date' in offer.attrs else "Sin tiempo",
         link=offer.get('destination') if 'destination' in offer.attrs else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Robert Half"
     )},
    {"name": "Randstad", "url": "https://www.randstad.cl/trabajos/", "use_browser": True, "selector": "li.cards__item", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.find('h3', class_='cards__title').a.text.strip() if offer.find('h3', class_='cards__title') else "Sin título",
         company=re.search(r'(Importante empresa.+?)(se encuentra|busca|requiere|$)', offer.find('div', class_='cards__description').text, re.I).group(1).strip() if re.search(r'(Importante empresa.+?)(se encuentra|busca|requiere|$)', offer.find('div', class_='cards__description').text, re.I) else "Sin empresa",
         region=offer.find('ul', class_='cards__meta').find_all('li')[0].text.split(', ')[1].strip() if len(offer.find('ul', class_='cards__meta').find_all('li')[0].text.split(', ')) > 1 else "Sin región",
         city=offer.find('ul', class_='cards__meta').find_all('li')[0].text.split(', ')[0].strip() if offer.find('ul', class_='cards__meta') else "Sin ciudad",
         comuna=offer.find('ul', class_='cards__meta').find_all('li')[0].text.split(', ')[0].title().strip() if offer.find('ul', class_='cards__meta') else "Sin comuna",
         country="Chile",
         description=offer.find('div', class_='cards__description').text.strip() if offer.find('div', class_='cards__description') else "Sin descripción",
         experience="Sin experiencia",
         salary=offer.find('ul', class_='cards__meta').find_all('li')[2].text.strip() if len(offer.find('ul', class_='cards__meta').find_all('li')) > 2 else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted="Sin tiempo",
         link=urljoin(base_url, offer.find('h3', class_='cards__title').a['href']) if offer.find('h3', class_='cards__title') else "Sin enlace",
         company_logo="Sin logo",
         portal_logo="Sin logo",
         source="Randstad"
     )},
    {"name": "UnMejorEmpleo", "url": "https://www.unmejorempleo.cl/empleos", "use_browser": True, "selector": "div.item-destacado, div.item-normal", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.find('a').text.strip() if offer.find('a') else "Sin título",
         company="Sin empresa",
         region=re.search(r'Región : (.+)', offer.find('li', class_='text-primary').text if offer.find('li', class_='text-primary') else "").group(1).strip() if re.search(r'Región : (.+)', offer.find('li', class_='text-primary').text if offer.find('li', class_='text-primary') else "") else "Sin región",
         city=re.search(r'Ubicación: (.+?)\\|', offer.find('li', class_='text-primary').text if offer.find('li', class_='text-primary') else "").group(1).strip() if re.search(r'Ubicación: (.+?)\\|', offer.find('li', class_='text-primary').text if offer.find('li', class_='text-primary') else "") else "Sin ciudad",
         comuna="Sin comuna",
         country="Chile",
         description=offer.find_all('li')[1].text.strip() if len(offer.find_all('li')) > 1 else "Sin descripción",
         experience="Sin experiencia",
         salary=re.search(r'Salario: (.+)', offer.find('li', class_='text-warning').text if offer.find('li', class_='text-warning') else "").group(1).strip() if re.search(r'Salario: (.+)', offer.find('li', class_='text-warning').text if offer.find('li', class_='text-warning') else "") else "Sin salario",
         date_posted=re.search(r'Publicación: (\\d{2}/\\d{2}/\\d{4})', offer.find('li', class_='text-warning').text if offer.find('li', class_='text-warning') else "").group(1) if re.search(r'Publicación: (\\d{2}/\\d{2}/\\d{4})', offer.find('li', class_='text-warning').text if offer.find('li', class_='text-warning') else "") else "Sin fecha",
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
         comuna=offer.select_one('.fs16.fc_base.mt5 > span.mr10').text.strip().split(', ')[0].split(' - ')[-1] if offer.select_one('.fs16.fc_base.mt5 > span.mr10') and ' - ' in offer.select_one('.fs16.fc_base.mt5 > span.mr10').text.strip().split(', ')[0] else "Sin comuna",
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
         experience=re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.select_one('p.sc-bTOkCG.eVZILH').text.strip() if offer.select_one('p.sc-bTOkCG.eVZILH') else "").group(0) if re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.select_one('p.sc-bTOkCG.eVZILH').text.strip() if offer.select_one('p.sc-bTOkCG.eVZILH') else "") else "Sin experiencia",
         salary=match.group(1) if (match := re.search(r'Renta:\\s*\\$([\\d.]+)', offer.select_one('p.sc-bTOkCG.eVZILH').text.strip() if offer.select_one('p.sc-bTOkCG.eVZILH') else "")) else "Sin salario",
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
    {"name": "Jooble", "url": "https://cl.jooble.org/SearchResult", "use_browser": True, "selector": "ul.kiBEcn > li > div.+n4WEb.rHG1ci", "active": True,
     "extract_func": lambda offer, base_url: create_unified_job_offer(
         title=offer.select_one('h2').text.strip() if offer.select_one('h2') else "Sin título",
         company=offer.select_one('div.company').text.strip() if offer.select_one('div.company') else "Sin empresa",
         region=location_text.split(', ')[1] if (location_text := offer.select_one('div.location').text.strip() if offer.select_one('div.location') else "") and ', ' in location_text and len(location_text.split(', ')) > 1 else "Sin región",
         city=location_text.split(', ')[0] if ', ' in location_text else "Sin ciudad",
         comuna=location_text.split(', ')[2] if len(location_text.split(', ')) > 2 else "Sin comuna",
         country="Chile",
         description=offer.select_one('div.description').text.strip() if offer.select_one('div.description') else "Sin descripción",
         experience=offer.select_one('div.experience').text.strip() if offer.select_one('div.experience') else re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.get_text(strip=True)).group(0) if re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.get_text(strip=True)) else "Sin experiencia",
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
         title=offer.select_one('h2.h3.project-title > span > a > span')['title'] if offer.select_one('h2.h3.project-title > span > a > span') and 'title' in offer.select_one('h2.h3.project-title > span > a > span').attrs else offer.select_one('h2.h3.project-title > span > a > span').text.strip() if offer.select_one('h2.h3.project-title > span > a > span') else "Sin título",
         company=offer.select_one('span.author-info.user-name > a > span').text.strip() if offer.select_one('span.author-info.user-name > a > span') else "Sin empresa",
         region="Sin región",
         city="Sin ciudad",
         comuna="Sin comuna",
         country=offer.select_one('span.country > span.country-name > a').text.strip() if offer.select_one('span.country > span.country-name > a') else "Chile",
         description=offer.select_one('div.html-desc.project-details > div > p > span').text.strip() if offer.select_one('div.html-desc.project-details > div > p > span') else "Sin descripción",
         experience="Sin experiencia",
         salary=offer.select_one('h4.budget > span.values > span').text.strip() if offer.select_one('h4.budget > span.values > span') else "Sin salario",
         date_posted="Sin fecha",
         time_since_posted=offer.select_one('span.date').text.strip().split(': ')[-1] if offer.select_one('span.date') else offer.select_one('h5.date.visible-xs > strong').text.strip(),
         link=urljoin(base_url, offer.select_one('h2.h3.project-title > span > a')['href']) if offer.select_one('h2.h3.project-title > span > a') else "Sin enlace",
         company_logo=offer.select_one('span.author-avatar > a > span > img')['src'] if offer.select_one('span.author-avatar > a > span > img') else "Sin logo",
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
         experience=re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.select_one('div.job-summary > div.job_advert__job-summary-text > p').text.strip() if offer.select_one('div.job-summary > div.job_advert__job-summary-text > p') else "").group(0) if re.search(r'(?i)(experiencia|junior|senior|de \\d+ a \\d+ años|\\d+ años)', offer.select_one('div.job-summary > div.job_advert__job-summary-text > p').text.strip() if offer.select_one('div.job-summary > div.job_advert__job-summary-text > p') else "") else "Sin experiencia",
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
    {"name": "Linkedin", "url": "https://cl.linkedin.com/jobs/oferta-de-trabajo-empleos?position=1&pageNum=0", "use_browser": True, "selector": "ul.jobs-search__results-list > li", "active": True,
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
         company_logo=offer.select_one('img.artdeco-entity-image')['src'] if offer.select_one('img.artdeco-entity-image') and 'src' in offer.select_one('img.artdeco-entity-image').attrs else "Sin logo",
         portal_logo="Sin logo",
         source="LinkedIn"
     )},
]