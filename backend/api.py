# /backend/api.py
from flask import Blueprint, request, jsonify
import traceback
from datetime import datetime                    # ←←← NUEVO: para el timestamp del health check
from db import supabase

api = Blueprint('api', __name__)

# ====================== JOBS ENDPOINT CORREGIDO ======================
@api.route('/jobs', methods=['GET'])
def get_jobs():
    try:
        page = int(request.args.get('page', 0))
        size = int(request.args.get('size', 50))

        print(f"📥 /api/jobs → page={page}, size={size}, params={dict(request.args)}")

        # Construimos la query correctamente
        query = supabase.table('job_offers') \
            .select("*") \
            .eq('is_active', True) \
            .order('scraped_at', desc=True)   # ← orden primero (esto soluciona el error)

        # Filtros
        if portals := request.args.get('portals'):
            query = query.in_('source', [p.strip() for p in portals.split(',') if p.strip()])
        if modalities := request.args.get('modalities'):
            query = query.in_('modality', [m.strip() for m in modalities.split(',') if m.strip()])
        if experiences := request.args.get('experiences'):
            query = query.in_('experience', [e.strip() for e in experiences.split(',') if e.strip()])
        if countries := request.args.get('countries'):
            query = query.in_('country', [c.strip() for c in countries.split(',') if c.strip()])
        if regions := request.args.get('regions'):
            query = query.in_('region', [r.strip() for r in regions.split(',') if r.strip()])
        if company := request.args.get('company'):
            query = query.ilike('company', f'%{company}%')

        # Búsqueda full-text
        if search := request.args.get('search'):
            query = query.text_search('search_vector', search)

        # Paginación
        result = query.range(page * size, (page + 1) * size - 1).execute()

        jobs = result.data or []
        has_more = len(jobs) == size

        print(f"✅ /api/jobs OK → {len(jobs)} jobs (page {page})")
        return jsonify({"jobs": jobs, "hasMore": has_more})

    except Exception as e:
        print("❌ ERROR en /api/jobs:")
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "trace": traceback.format_exc()
        }), 500


# ====================== HEALTH CHECK (nuevo endpoint) ======================
@api.route('/health', methods=['GET'])
def health():
    """Endpoint simple para verificar que la API está corriendo"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }), 200


print("✅ API v2.5 cargada (order + text_search + health check)")