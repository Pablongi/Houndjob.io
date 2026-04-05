# /backend/api_favorites.py
from flask import Blueprint, request, jsonify
from db import supabase
from functools import wraps
import jwt

api_fav = Blueprint('api_favorites', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({"error": "Token requerido"}), 401
        try:
            token = token.split(' ')[1]
            # Supabase JWT verification
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload['sub']
            return f(user_id, *args, **kwargs)
        except:
            return jsonify({"error": "Token inválido"}), 401
    return decorated

@api_fav.route('/favorites', methods=['POST'])
@token_required
def toggle_favorite(user_id):
    data = request.json
    job_id = data.get('job_id')
    if not job_id:
        return jsonify({"error": "job_id requerido"}), 400

    # Verificar si ya existe
    existing = supabase.table('user_favorites') \
        .select('id') \
        .eq('user_id', user_id) \
        .eq('job_id', job_id) \
        .execute()

    if existing.data:
        # Eliminar
        supabase.table('user_favorites').delete().eq('id', existing.data[0]['id']).execute()
        status = 'removed'
    else:
        # Agregar + incrementar vista
        supabase.table('user_favorites').insert({
            'user_id': user_id,
            'job_id': job_id
        }).execute()
        # Incrementar vista
        supabase.table('job_offers').update({'views': supabase.rpc('increment_views', {'jobid': job_id})}).eq('id', job_id).execute()
        status = 'added'

    return jsonify({"status": status})