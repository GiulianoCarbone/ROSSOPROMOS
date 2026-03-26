-- Tabla para registrar visitas y contactos (clicks en WhatsApp)
CREATE TABLE page_views (
  id bigserial PRIMARY KEY,
  visited_at timestamptz DEFAULT now(),
  event_type text DEFAULT 'visit'  -- 'visit' o 'contact'
);

-- Activar Row Level Security
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Cualquier visitante (anónimo) puede insertar registros
CREATE POLICY "Allow anonymous inserts on page_views"
  ON page_views FOR INSERT TO anon
  WITH CHECK (true);

-- Solo usuarios autenticados pueden leer (para el admin)
CREATE POLICY "Allow authenticated reads on page_views"
  ON page_views FOR SELECT TO authenticated
  USING (true);
