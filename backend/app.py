from flask import Flask, request
import os
import asyncio
from scraper import main as run_scraper
from ml.ml_homologate import model, classifier, nlp  # Preload from ml_homologate

app = Flask(__name__)

@app.route('/run', methods=['GET', 'POST'])
async def trigger_scraper():
    try:
        await run_scraper()  # Async
        return "Scrape + ML completed!", 200
    except Exception as e:
        return f"Error: {str(e)}", 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)