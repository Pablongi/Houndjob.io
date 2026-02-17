FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y build-essential libblas-dev liblapack-dev gfortran
RUN pip install --no-cache-dir -r requirements.txt
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-8080} --workers=4 app:app"]