# /backend/utils/logger.py
import logging
import sys
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger(__name__)

# Helpers bonitos (igual que en frontend)
def success(msg): logger.info(f"✅ {msg}")
def info(msg):    logger.info(f"ℹ️ {msg}")
def warning(msg): logger.warning(f"⚠️ {msg}")
def error(msg):   logger.error(f"❌ {msg}")
def debug(msg):   logger.debug(f"🐛 {msg}")