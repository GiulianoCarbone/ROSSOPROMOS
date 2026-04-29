-- Función para agregar métricas del dashboard, evitando el límite de 1000 filas
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
CREATE OR REPLACE FUNCTION get_metrics_summary(
  from_date timestamptz,
  to_date   timestamptz
)
RETURNS TABLE (
  day           date,
  visit_count   bigint,
  contact_count bigint
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    visited_at::date AS day,
    COUNT(*) FILTER (WHERE event_type = 'visit')   AS visit_count,
    COUNT(*) FILTER (WHERE event_type = 'contact') AS contact_count
  FROM page_views
  WHERE visited_at >= from_date
    AND visited_at <= to_date
  GROUP BY visited_at::date
  ORDER BY day;
$$;

-- Dar acceso a la función para usuarios autenticados
GRANT EXECUTE ON FUNCTION get_metrics_summary TO authenticated;
