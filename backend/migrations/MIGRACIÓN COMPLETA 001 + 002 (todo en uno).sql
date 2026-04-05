-- =============================================
-- MIGRACIÓN COMPLETA 001 + 002 (todo en uno)
-- =============================================

-- 1. Tabla job_offers (agrega columnas si no existen)
ALTER TABLE job_offers 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS job_hash TEXT UNIQUE;

-- 2. Tabla user_favorites (crea si no existe)
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT REFERENCES job_offers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- 3. RLS (seguridad)
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see own favorites" ON user_favorites;
CREATE POLICY "Users can only see own favorites" ON user_favorites
  USING (auth.uid()::text = user_id);

-- 4. Función y Trigger mejorado (views counter)
CREATE OR REPLACE FUNCTION increment_views_on_favorite()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE job_offers 
  SET views = views + 1 
  WHERE id = NEW.job_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Borramos el trigger viejo (si existía de la 001) y creamos el nuevo
DROP TRIGGER IF EXISTS trigger_increment_views ON user_favorites;
CREATE TRIGGER trigger_increment_views
AFTER INSERT ON user_favorites
FOR EACH ROW EXECUTE FUNCTION increment_views_on_favorite();

-- 5. Índices recomendados (para que todo vaya rápido)
CREATE INDEX IF NOT EXISTS idx_job_offers_active_scraped ON job_offers(is_active, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_offers_source ON job_offers(source);
CREATE INDEX IF NOT EXISTS idx_job_offers_region ON job_offers(region);
CREATE INDEX IF NOT EXISTS idx_job_offers_views ON job_offers(views DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);

SELECT '✅ MIGRACIÓN COMPLETA (001 + 002) EJECUTADA CON ÉXITO' AS mensaje;