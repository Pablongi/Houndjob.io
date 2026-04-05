# /backend/app.py
from flask import Flask, jsonify, render_template_string, request
import os
from datetime import datetime
from db import supabase
from api import api

app = Flask(__name__)

# ====================== CORS + RATE LIMITING ======================
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from api_favorites import api_fav


CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "https://houndjob.vercel.app"]}})
limiter = Limiter(get_remote_address, app=app, default_limits=["200 per minute"])

# ====================== REDUCIR SPAM DE LOGS ======================
import logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)          # Solo muestra errores reales

# ====================== REGISTRO DEL BLUEPRINT ======================
app.register_blueprint(api, url_prefix='/api')


app.register_blueprint(api_fav, url_prefix='/api')

# ====================== RUTAS DEL DASHBOARD ======================
@app.route('/admin/status')
def admin_status():
    try:
        total = supabase.table('job_offers').select('id', count='exact').execute().count or 0
        return jsonify({"global": {"total_jobs": total, "running": False}})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/supabase-stats')
def supabase_stats():
    try:
        total = supabase.table('job_offers').select('id', count='exact').execute().count or 0
        today_str = datetime.now().strftime('%Y-%m-%d')   # ← utcnow() deprecated
        today = supabase.table('job_offers') \
            .select('id', count='exact') \
            .gte('scraped_at', today_str) \
            .execute().count or 0
        return jsonify({"total_ofertas": total, "hoy": today, "status": "OK"})
    except Exception as e:
        return jsonify({"error": str(e), "status": "Error"}), 500


@app.route('/admin/dashboard')
def admin_dashboard():
    # Si quieres desactivar el refresco automático, usa ?refresh=false
    refresh = request.args.get('refresh', 'true').lower() != 'false'
    interval = 30000 if refresh else 0   # 30 segundos en vez de 5

    html = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HoundJob - Admin Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <style>
        body {{ font-family: 'Inter', system-ui, sans-serif; }}
        .card {{ transition: all 0.3s; }}
        .card:hover {{ transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); }}
    </style>
</head>
<body class="bg-gray-50">
    <div class="max-w-7xl mx-auto p-6">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-4xl font-bold text-gray-900 flex items-center gap-3">
                    🐕 HoundJob <span class="text-sm font-normal text-gray-500">Admin Dashboard</span>
                </h1>
                <p class="text-gray-600 mt-1">Monitoreo de base de datos (scraper apagado)</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 class="text-gray-500 text-sm font-medium">TOTAL OFERTAS</h3>
                <div id="total-ofertas" class="text-5xl font-bold text-gray-900 mt-3">0</div>
            </div>
            <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 class="text-gray-500 text-sm font-medium">HOY</h3>
                <div id="hoy" class="text-5xl font-bold text-emerald-600 mt-3">0</div>
            </div>
            <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 class="text-gray-500 text-sm font-medium">ESTADO</h3>
                <div class="flex items-center gap-3 mt-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="text-xl font-semibold text-green-600">DB Activa</span>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 class="font-semibold text-lg mb-6">Estado actual</h3>
            <div id="status" class="font-mono text-sm bg-gray-900 text-green-400 p-6 rounded-2xl h-64 overflow-y-auto"></div>
        </div>
    </div>

    <script>
        async function updateDashboard() {{
            const stats = await (await fetch('/admin/supabase-stats')).json();
            document.getElementById('total-ofertas').textContent = stats.total_ofertas || 0;
            document.getElementById('hoy').textContent = stats.hoy || 0;
            document.getElementById('status').innerHTML = `Total jobs: ${{stats.total_ofertas}}<br>Hoy: ${{stats.hoy}}`;
        }}
        { "setInterval(updateDashboard, " + interval + "); updateDashboard();" if interval > 0 else "updateDashboard();" }
    </script>
</body>
</html>
    """
    return render_template_string(html)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"🚀 HoundJob Backend en http://0.0.0.0:{port}")
    # En producción NO usar app.run()