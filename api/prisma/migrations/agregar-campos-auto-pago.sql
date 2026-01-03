-- ==========================================
-- MIGRACIÓN: Agregar campos adicionales
-- ==========================================
--
-- Esta migración agrega:
-- 1. Campos adicionales a la tabla Auto (kilometraje, departamento, tipoDocumento, valorPatente, color)
-- 2. Campo comentario a la tabla Pago (para explicar motivo de no pago en cuotas vencidas)
--
-- ==========================================

-- Paso 1: Agregar nuevos campos a la tabla Auto
ALTER TABLE "Auto" 
  ADD COLUMN IF NOT EXISTS "kilometraje" INTEGER,
  ADD COLUMN IF NOT EXISTS "departamento" TEXT,
  ADD COLUMN IF NOT EXISTS "tipoDocumento" TEXT,
  ADD COLUMN IF NOT EXISTS "valorPatente" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "color" TEXT;

-- Paso 2: Agregar campo comentario a la tabla Pago
ALTER TABLE "Pago"
  ADD COLUMN IF NOT EXISTS "comentario" TEXT;

-- Paso 3: Verificar que los campos se agregaron correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'Auto'
  AND column_name IN ('kilometraje', 'departamento', 'tipoDocumento', 'valorPatente', 'color')
ORDER BY column_name;

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'Pago'
  AND column_name = 'comentario';

-- ==========================================
-- RESULTADO ESPERADO:
-- 5 columnas nuevas en Auto
-- 1 columna nueva en Pago
-- ==========================================

