-- Script SQL SIMPLE para corregir la tabla ComprobantePago
-- Ejecutar este script completo en el SQL Editor de Neon

-- Paso 1: Asegurar que la columna archivoUrl pueda almacenar datos grandes (base64 de PDFs)
ALTER TABLE "ComprobantePago" 
ALTER COLUMN "archivoUrl" TYPE TEXT;

-- Paso 2: Asegurar que numeroCuenta tenga un valor por defecto vacío
ALTER TABLE "ComprobantePago" 
ALTER COLUMN "numeroCuenta" SET DEFAULT '';

-- Paso 3: Verificar que los valores por defecto estén correctos
ALTER TABLE "ComprobantePago" 
ALTER COLUMN "estado" SET DEFAULT 'pendiente';

ALTER TABLE "ComprobantePago" 
ALTER COLUMN "visto" SET DEFAULT false;

-- Paso 4: Crear función para actualizar updatedAt automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Paso 5: Crear trigger para actualizar updatedAt
DROP TRIGGER IF EXISTS update_comprobantepago_updated_at ON "ComprobantePago";
CREATE TRIGGER update_comprobantepago_updated_at
    BEFORE UPDATE ON "ComprobantePago"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Paso 6: Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS "ComprobantePago_pagoId_idx" ON "ComprobantePago"("pagoId");
CREATE INDEX IF NOT EXISTS "ComprobantePago_estado_idx" ON "ComprobantePago"("estado");
CREATE INDEX IF NOT EXISTS "ComprobantePago_visto_idx" ON "ComprobantePago"("visto");

-- Verificación final
SELECT 'Tabla ComprobantePago corregida exitosamente. Ya puedes subir comprobantes PDF.' AS resultado;

