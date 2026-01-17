from flask import Flask, request
import os
import asyncio  # Agregado para async scraper
from scraper import main as run_scraper  # Importa main scraper

app = Flask(__name__)

@app.route('/run', methods=['GET', 'POST'])  # Endpoint para trigger
def trigger_scraper():
    try:
        asyncio.run(run_scraper())  # Corre scraper + ML (async ok)
        return "Scrape + ML completed!", 200
    except Exception as e:
        return f"Error: {str(e)}", 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # 5000 safe local
    app.run(host='0.0.0.0', port=port)  # Flask dev para local; gunicorn en prod