from flask import Flask
import os
import asyncio
from scraper import main as run_scraper

app = Flask(__name__)

@app.route('/run', methods=['GET', 'POST'])
def trigger_scraper():  # Quita "async"
    try:
        asyncio.run(run_scraper())  # Ejecuta async dentro sync
        return "Scrape completed!", 200
    except Exception as e:
        return f"Error: {str(e)}", 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)