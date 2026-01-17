import json
import requests
from bs4 import BeautifulSoup
import time
import random
from utils import portals, logger, get_proxy, get_user_agent, VALID_PROXIES, create_unified_job_offer, validate_offer

def load_scrape_results(file='empleos.json'):
    try:
        with open(file, 'r', encoding='utf-8') as f:
            data = f.read().strip()
            if not data:
                return [], [], [p['name'] for p in portals if p.get('active', True)]
            all_jobs = json.loads(data)
        scraped_portals = list(all_jobs.keys())
        failed_portals = [p['name'] for p in portals if p.get('active', True) and (p['name'] not in scraped_portals or len(all_jobs[p['name']]) == 0)]
        success_portals = [p['name'] for p in portals if p.get('active', True) and p['name'] in scraped_portals and len(all_jobs[p['name']]) > 0]
        return scraped_portals, success_portals, failed_portals
    except json.JSONDecodeError as e:
        logger.error(f"JSON error in {file}: {str(e)} - Treating as no data.")
        return [], [], [p['name'] for p in portals if p.get('active', True)]
    except FileNotFoundError:
        logger.warning(f"{file} not found - assuming all active portals failed.")
        return [], [], [p['name'] for p in portals if p.get('active', True)]
    except Exception as e:
        logger.error(f"Error loading {file}: {str(e)}")
        return [], [], []

def diagnose_portal(portal):
    name = portal['name']
    url = portal['url']
    use_browser = portal.get('use_browser', False)
    selector = portal.get('selector')
    extract_func = portal.get('extract_func', lambda x, y: create_unified_job_offer())
    
    reasons = []
    stop_point = "Initial check"
    
    try:
        # Step 0: Config validation
        stop_point = "Config validation"
        if not url.startswith(('http://', 'https://')):
            reasons.append("Invalid URL format - must start with http/https.")
            raise ValueError("Invalid URL")
        if not selector:
            reasons.append("Missing selector - cannot locate offers on page.")
            raise ValueError("Missing selector")
        if not callable(extract_func):
            reasons.append("Invalid extract_func - not callable.")
            raise ValueError("Invalid extract_func")
        
        # Step 1: Proxy/User-Agent setup
        stop_point = "Setup (proxy/UA)"
        proxy = get_proxy()
        if not VALID_PROXIES:
            reasons.append("(Global) No valid proxies - all PROXIES invalid/down; scraping without may cause blocks.")
        headers = {"User-Agent": get_user_agent()}
        proxies = {"http": proxy, "https": proxy} if proxy else None
        reasons.append(f"Setup OK. Proxy: {'Yes' if proxy else 'No'}. UA: {headers['User-Agent'][:30]}...")
        
        # Step 2: HEAD request
        stop_point = "HEAD request"
        head_response = requests.head(url, headers=headers, proxies=proxies, timeout=10, verify=False)
        if head_response.status_code != 200:
            reasons.append(f"HEAD failed (HTTP {head_response.status_code}) - connectivity/block before full load.")
            raise requests.HTTPError(f"HEAD HTTP {head_response.status_code}")
        
        # Step 3: GET request
        stop_point = "GET request"
        response = requests.get(url, headers=headers, proxies=proxies, timeout=20, verify=False)
        if response.status_code != 200:
            reasons.append(f"GET failed (HTTP {response.status_code}; HEAD was OK) - possible anti-bot or dynamic block.")
            raise requests.HTTPError(f"GET HTTP {response.status_code}")
        
        content = response.text.lower()
        if any(term in content for term in ["captcha", "recaptcha", "cloudflare", "turnstile", "verify you are human"]):
            reasons.append("Anti-bot (CAPTCHA/Cloudflare) detected in content - blocks scraping.")
        elif any(term in content for term in ["blocked", "forbidden", "access denied", "403"]):
            reasons.append("Explicit block/403 in content - IP/UA flagged as bot.")
        
        # Step 4: HTML parsing
        stop_point = "HTML parsing"
        soup = BeautifulSoup(response.text, 'html.parser')
        if len(soup.find_all()) < 50:
            reasons.append("Parsed HTML too small/empty - likely incomplete load, JS required, or no content.")
            raise ValueError("Parse empty")
        
        # Step 5: Selector matching
        stop_point = "Selector matching"
        offers = soup.select(selector) if selector else []
        if not offers:
            reasons.append("Selector failed - no matching elements; page structure may have changed.")
            fallback_offers = soup.find_all(lambda tag: tag.name in ['div', 'article', 'li'] and any(cls in tag.get('class', []) for cls in ['job', 'oferta', 'vacancy', 'item']))
            if fallback_offers:
                reasons.append(f"Fallback found {len(fallback_offers)} potential offers - consider updating selector to match these.")
            raise ValueError("No offers matched")
        reasons.append(f"Matched {len(offers)} offers with selector - selection OK.")
        
        # Step 6: Data extraction
        stop_point = "Data extraction"
        if len(offers) > 0:
            sample_job = extract_func(offers[0], url)
            empty_fields = [field for field in ['title', 'city'] if sample_job.get(field, "") in ["", "No disponible", "Sin " + field]]
            if empty_fields:
                reasons.append(f"Extraction incomplete - required fields missing: {', '.join(empty_fields)}; check extract_func tags.")
                raise ValueError("Extraction incomplete")
            reasons.append("Extraction OK - sample job has key fields.")
        else:
            raise ValueError("No offers to extract")
        
        # Step 7: Validation
        stop_point = "Offer validation"
        if not validate_offer(sample_job):
            reasons.append("Validation failed - even after extraction, required fields invalid/empty.")
            raise ValueError("Validation failed")
        reasons.append("Validation OK.")
        
        # If all passed
        stop_point = "Full success"
        reasons.append("All scraping steps succeeded - if 0 jobs in run, possible no real offers or max_offers/filter issue.")
    
    except requests.Timeout as e:
        reasons.append(f"Timeout error at {stop_point}: {str(e)} - network/site slow.")
    except requests.ConnectionError as e:
        reasons.append(f"Connection error at {stop_point}: {str(e)} - proxy/site down.")
    except requests.HTTPError as e:
        reasons.append(f"HTTP error at {stop_point}: {str(e)} - anti-scraping/auth issue.")
    except ValueError as e:
        reasons.append(f"Value/logic error at {stop_point}: {str(e)} - config/extract issue.")
    except Exception as e:
        reasons.append(f"Unexpected error at {stop_point}: {str(e)} - code bug or unhandled case.")
    
    # Browser-specific note
    if use_browser:
        reasons.append("(Note) Portal configured for browser - diag used requests; real issue may be JS-dependent content.")
    
    return {"name": name, "stop_point": stop_point, "reasons": reasons or ["No detectable errors - check for empty site or filters."]}

def run_diagnosticador():
    print("🩺 DIAGNOSTICANDO FALLOS EN SCRAPING...")
    print("=" * 60)
    
    scraped, successes, failures = load_scrape_results()
    print(f"\n📊 Resumen: {len(successes)} OK, {len(failures)} Fallidos de {len(scraped)} scrapeados.")
    
    for name in successes:
        print(f"\n✅ {name}: Scraped OK (no diagnóstico needed).")
    
    for portal in [p for p in portals if p['name'] in failures]:
        print(f"\n🔍 Diagnosticando Fallido: {portal['name']}")
        diag = diagnose_portal(portal)
        print(f"   ❌ Stop at: {diag['stop_point']}")
        for reason in diag['reasons']:
            print(f"     - {reason}")
        
        logger.info(f"Diagnóstico {portal['name']}: Stop at {diag['stop_point']}; {', '.join(diag['reasons'])}")
    
    print("\n🎉 ¡DIAGNÓSTICO COMPLETO! Focus en fixes para fallidos.")

if __name__ == "__main__":
    run_diagnosticador()