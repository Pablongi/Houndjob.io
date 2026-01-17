import schedule
import time
from ml_prep import prepare_data
from ml_homologate import advanced_homologate

def job():
    prepare_data()
    advanced_homologate()

schedule.every().monday.at("00:00").do(job)  # Weekly lunes 00:00

while True:
    schedule.run_pending()
    time.sleep(60)  # Check minutely