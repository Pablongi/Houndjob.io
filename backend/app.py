from flask import Flask
import os
import threading
import asyncio
from scraper import main as run_scraper

app = Flask(__name__)

def run_scraper_background():
    try:
        asyncio.run(run_scraper())
        print("Scrape completed in background!")
    except Exception as e:
        print(f"Scraper error: {str(e)}")

@app.route('/run', methods=['GET', 'POST'])
def trigger_scraper():
    threading.Thread(target=run_scraper_background, daemon=True).start()
    return "Scrape started in background! Check logs for progress.", 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)