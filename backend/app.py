from flask import Flask
import os
import asyncio
from scraper import main as run_scraper

app = Flask(__name__)

@app.route('/run', methods=['GET', 'POST'])
async def trigger_scraper():
    try:
        await run_scraper()
        return "Scrape completed! (ML temporalmente desactivado - jobs crudos guardados)", 200
    except Exception as e:
        return f"Error: {str(e)}", 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)