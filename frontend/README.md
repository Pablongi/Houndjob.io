# HOUNDJOB

Proyecto full-stack para scraping y visualización de ofertas de empleo en Chile.

## Estructura
- **backend/**: Python scraper to Supabase.
- **frontend/**: React/TS app with Supabase.

## Setup Backend
1. cd backend
2. python -m venv venv
3. venv\Scripts\activate (Windows) or source venv/bin/activate (Unix)
4. pip install -r requirements.txt
5. Add .env with SUPABASE_URL/SERVICE_KEY/ANON_KEY.
6. python scraper.py to scrape.
7. python diagnosticador.py for diag.
8. python viewer.py to view.

## Setup Frontend
1. cd frontend
2. npm install
3. Add .env with VITE_SUPABASE_URL/ANON_KEY.
4. npm run dev

## Run Full
- Run backend scraper first to populate Supabase.
- Then frontend to view.

## Notes
- Use Supabase dashboard for table 'job_offers'.
- For errors, run npm run clean:deps and restart VS Code.
- Future: Add cron for scrape, more portales.