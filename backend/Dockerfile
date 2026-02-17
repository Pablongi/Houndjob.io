FROM python:3.12-slim

# Dependencias del sistema para Playwright/Chromium (formato correcto)
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgdk-pixbuf-2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxtst6 \
    xkb-data \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

# Instala setuptools primero (fix pkg_resources)
RUN pip install --no-cache-dir setuptools

# Instala el resto de dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Instala Chromium para Playwright
RUN playwright install chromium --with-deps

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-8080} --workers=4 app:app"]