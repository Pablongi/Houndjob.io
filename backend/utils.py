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
from dateutil.tz import tzutc
try:
    from twocaptcha import TwoCaptcha
except ImportError:
    TwoCaptcha = None

warnings.filterwarnings('ignore', category=requests.packages.urllib3.exceptions.InsecureRequestWarning)
logger = logging.getLogger(__name__)

PROXIES = [
    'http://190.152.19.190:80',
    'http://200.73.128.57:3128',
    'http://190.152.5.126:80',
    'http://45.228.147.239:999',
    'http://190.82.93.158:80',
    'http://45.71.184.107:999',
    'http://190.110.99.130:80',
    'http://190.103.177.131:80',
    'http://190.152.19.190:80',
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

async def validate_proxy_async(proxy, test_url="https://www.google.com", timeout=5):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(test_url, proxy=proxy, timeout=timeout) as response:
                return response.status == 200
    except:
        return False

async def validate_proxies_async():
    tasks = [validate_proxy_async(p) for p in PROXIES]
    results = await asyncio.gather(*tasks)
    return [p for p, valid in zip(PROXIES, results) if valid]

VALID_PROXIES = asyncio.run(validate_proxies_async())

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
        "title": "No disponible", "company": "No disponible", "city": "No disponible",
        "region": "No disponible", "comuna": "No disponible", "country": "Chile",
        "description": "No disponible", "experience": "Sin experiencia",
        "salary": "No disponible", "date_posted": "No disponible",
        "time_since_posted": kwargs.get('time_since_posted', "Sin tiempo"),
        "link": "No disponible", "company_logo": "Sin logo",
        "portal_logo": "Sin logo", "source": "No disponible",
    }
    default_fields.update(kwargs)
    return default_fields

def validate_offer(offer):
    required_fields = ['title', 'city']
    return all(offer[field] != "No disponible" and offer[field] != "Sin " + field and offer[field] != "" for field in required_fields)

def is_valid_link(link, portal_url):
    invalid_patterns = ['login', 'contactanos', 'contact', 'signup', 'register', 'trabajar-en']
    return link != "Sin enlace" and not any(pattern in link.lower() for pattern in invalid_patterns) and portal_url in link

chilean_locations = [
    "santiago", "valparaíso", "concepción", "la serena", "antofagasta", "temuco", "rancagua", "talca", "arica", "puerto montt",
    "iqq", "calama", "osorno", "chillán", "valdivia", "copiapó", "coquimbo", "viña del mar", "quilicura", "las condes", "maipú",
    "ñuñoa", "huechuraba", "providencia", "pudahuel", "quinta normal", "san bernardo", "lo barnechea", "colina", "lampa",
    "talagante", "peñaflor", "melipilla", "padre hurtado", "curacautín", "villarrica", "pucón", "lautaro", "angol", "victoria",
    "lebu", "arauco", "cañete", "curanilahue", "los ángeles", "nacimiento", "mulchén", "collipulli", "loncoche", "gorbea",
    "freire", "nueva imperial", "carahue", "saavedra", "tirúa", "contulmo", "purén", "renaico", "los sauces", "traiguén", "lumaco",
    "evaluación", "región metropolitana", "región de valparaíso", "región del biobío", "región de la araucanía", "región de los ríos",
    "región de los lagos", "región de antofagasta", "región de atacama", "región de coquimbo", "región de o'higgins", "región del maule",
    "región de ñuble", "región de arica y parinacota", "región de tarapacá", "región de magallanes", "región de aysén"
]

def is_location(string):
    if not string or string.lower() in ["sin fecha", "no disponible", "sin tiempo"]:
        return False
    lower_string = string.lower().strip()
    for loc in chilean_locations:
        if loc in lower_string:
            return True
    if re.match(r'^[a-záéíóúñ]+(,\s*[a-záéíóúñ]+)?$', lower_string):
        return True
    return False

def normalize_date_posted(date_str):
    if not date_str or date_str.lower() in ["sin fecha", "no disponible", "sin tiempo"]:
        return ""
    parsed = dateparser.parse(date_str, languages=['es'], settings={'PREFER_DATES_FROM': 'past'})
    if parsed:
        return parsed.strftime('%Y-%m-%d')
    return date_str

async def async_scrape_requests(session, url, headers, proxy, selector, extract_func, max_offers=3, portal_name=""):
    cache = load_cache(portal_name)
    if cache:
        valid_offers = [j for j in cache if validate_offer(j)]
        if valid_offers:
            return valid_offers, {"success": True, "message": "Cache hit"}
    for attempt in range(3):
        try:
            timeout = aiohttp.ClientTimeout(total=20)
            async with session.get(url, headers=headers, proxy=proxy, timeout=timeout, ssl=False) as response:
                if response.status != 200:
                    return [], {"success": False, "message": f"HTTP {response.status}"}
                text = await response.text()
                soup = BeautifulSoup(text, 'html.parser')
            offers = soup.select(selector) if selector else []
            if not offers:
                offers = ([elem for elem in soup.find_all('div', class_=lambda x: x and ('job' in str(x).lower() or 'oferta' in str(x).lower() or 'vacancy' in str(x).lower() or 'listing' in str(x).lower() or 'item' in str(x).lower() or 'project' in str(x).lower() or 'result' in str(x).lower())) if elem] or
                         [elem for elem in soup.find_all('article') if elem] or
                         [elem for elem in soup.find_all('li') if elem])
            job_offers = []
            for offer in offers[:max_offers]:
                try:
                    job = extract_func(offer, url) if extract_func else create_unified_job_offer(source="Unknown")
                except Exception as e:
                    logger.warning(f"Error en extract_func para {portal_name}: {str(e)}")
                    job = create_unified_job_offer(source=portal_name)
                for field in ['title', 'company', 'location', 'salary', 'date_posted', 'description']:
                    elem = offer.find(['h1', 'h2', 'h3', 'span', 'div', 'p'], string=lambda t: t and field in t.lower()) or offer.find(['h1', 'h2', 'h3', 'span', 'div', 'p'], class_=lambda x: x and field in x.lower())
                    if elem:
                        job[field] = elem.get_text(strip=True).replace('Ninguno', '').strip() or job[field]
              
                if is_location(job.get("date_posted", "")):
                    job["date_posted"] = "Sin fecha"
              
                job["date_posted"] = normalize_date_posted(job.get("date_posted", ""))
              
                if not job['link'] or 'No disponible' in job['link'] or not is_valid_link(job['link'], url):
                    link_elem = offer.find('a', href=True)
                    if link_elem:
                        href = link_elem['href']
                        job['link'] = urljoin(url, href) if href.startswith('/') else href if href.startswith('http') and is_valid_link(href, url) else "Sin enlace"
                job_offers.append(job)
            valid_offers = [j for j in job_offers if validate_offer(j)]
            if valid_offers:
                save_cache(portal_name, valid_offers)
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
                cookie_selectors = [
                    '#onetrust-accept-btn-handler', '#cookiescript_accept', '#cookies-accept',
                    'button[aria-label="Aceptar todo"]', '.ot-sdk-btn.accept-btn-handler',
                    '[data-cs-i18n-text*="Aceptar todo"]', '#accept-cookies', '.cookie-accept',
                    '.btn-cookie-accept', 'button.accept-all', '.gdpr-accept'
                ]
                for sel in cookie_selectors:
                    try:
                        await page.wait_for_selector(sel, timeout=10000)
                        await page.click(sel)
                        await asyncio.sleep(0.5)
                    except:
                        pass
                content = await page.content()
                if "captcha" in content.lower() or "un momento" in content.lower():
                    if TwoCaptcha:
                        solver = TwoCaptcha(TWOCAPTCHA_API_KEY)
                        site_key = await page.evaluate("() => document.querySelector('[data-sitekey]')?.getAttribute('data-sitekey')")
                        if site_key:
                            try:
                                result = solver.recaptcha(sitekey=site_key, url=page.url)
                                code = result['code']
                                await page.evaluate(f"document.getElementById('g-recaptcha-response').innerHTML = '{code}';")
                                try:
                                    await page.click('button[type="submit"], input[type="submit"]')
                                except:
                                    await page.evaluate("document.querySelector('form').submit()")
                                await asyncio.sleep(5)
                                content = await page.content()
                            except Exception as e:
                                logger.warning(f"CAPTCHA solve fail for {portal_name}: {str(e)} - Retry attempt {attempt+1}")
                        else:
                            logger.warning(f"No site_key for CAPTCHA in {portal_name}")
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
                        job = create_unified_job_offer(source=portal_name)
                    for field in ['title', 'company', 'location', 'salary', 'date_posted', 'description']:
                        elem = offer.find(['h1', 'h2', 'h3', 'span', 'div', 'p'], string=lambda t: t and field in t.lower()) or offer.find(['h1', 'h2', 'h3', 'span', 'div', 'p'], class_=lambda x: x and field in x.lower())
                        if elem:
                            job[field] = elem.get_text(strip=True).replace('Ninguno', '').strip() or job[field]
                  
                    if is_location(job.get("date_posted", "")):
                        job["date_posted"] = "Sin fecha"
                  
                    job["date_posted"] = normalize_date_posted(job.get("date_posted", ""))
                  
                    if not job['link'] or 'No disponible' in job['link'] or not is_valid_link(job['link'], url):
                        link_elem = offer.find('a', href=True)
                        if link_elem:
                            href = link_elem['href']
                            job['link'] = urljoin(url, href) if href.startswith('/') else href if href.startswith('http') and is_valid_link(href, url) else "Sin enlace"
                    job_offers.append(job)
                valid_offers = [j for j in job_offers if validate_offer(j)]
                if valid_offers:
                    save_cache(portal_name, valid_offers)
                time_taken = time.time() - start_time
                diag = {"success": bool(valid_offers), "message": "Playwright success" if valid_offers else "No valid offers", "proxy_used": proxy or "None", "time_taken": time_taken}
                await browser.close()
                return valid_offers, diag
        except Exception as e:
            if attempt == 2:
                return [], {"success": False, "message": str(e)}