-- Run this in your Supabase SQL Editor to enable manual ordering

ALTER TABLE products 
ADD COLUMN position BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000);

-- Optional: Initialize existing items with a sequence so they have a distinct order initially
-- WITH sequences AS (
--   SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rnum
--   FROM products
-- )
-- UPDATE products
-- SET position = s.rnum * 1000
-- FROM sequences s
-- WHERE products.id = s.id;
