-- Script SQL para corregir la tabla ComprobantePago y permitir almacenar PDFs en base64
-- Ejecutar este script en el SQL Editor de Neon

-- 1. Verificar si la tabla existe, si no existe, crearla
CREATE TABLE IF NOT EXISTS "ComprobantePago" (
    "id" SERIAL NOT NULL,
    "pagoId" INTEGER NOT NULL,
    "numeroCuenta" TEXT NOT NULL DEFAULT '',
    "archivoUrl" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "visto" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComprobantePago_pkey" PRIMARY KEY ("id")
);

-- 2. Modificar la columna archivoUrl para asegurar que pueda almacenar datos grandes (base64)
-- En PostgreSQL, TEXT ya puede almacenar hasta 1GB, pero nos aseguramos de que no haya restricciones
ALTER TABLE "ComprobantePago" ALTER COLUMN "archivoUrl" TYPE TEXT;

-- 3. Asegurar que numeroCuenta pueda ser string vacío (ya debería funcionar, pero lo verificamos)
ALTER TABLE "ComprobantePago"
ALTER COLUMN "numeroCuenta"
SET DEFAULT '';

-- 4. Asegurar que los valores por defecto estén correctos
ALTER TABLE "ComprobantePago"
ALTER COLUMN "estado"
SET DEFAULT 'pendiente';

ALTER TABLE "ComprobantePago" ALTER COLUMN "visto" SET DEFAULT false;

-- 5. Asegurar que updatedAt se actualice automáticamente
-- Crear función para actualizar updatedAt automáticamente si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updatedAt automáticamente
DROP TRIGGER IF EXISTS update_comprobantepago_updated_at ON "ComprobantePago";

CREATE TRIGGER update_comprobantepago_updated_at
    BEFORE UPDATE ON "ComprobantePago"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Verificar y crear la foreign key si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ComprobantePago_pagoId_fkey'
    ) THEN
        ALTER TABLE "ComprobantePago"
        ADD CONSTRAINT "ComprobantePago_pagoId_fkey" 
        FOREIGN KEY ("pagoId") 
        REFERENCES "Pago" ("id") 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- 7. Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS "ComprobantePago_pagoId_idx" ON "ComprobantePago" ("pagoId");

CREATE INDEX IF NOT EXISTS "ComprobantePago_estado_idx" ON "ComprobantePago" ("estado");

CREATE INDEX IF NOT EXISTS "ComprobantePago_visto_idx" ON "ComprobantePago" ("visto");

CREATE INDEX IF NOT EXISTS "ComprobantePago_createdAt_idx" ON "ComprobantePago" ("createdAt");

-- 8. Verificar la estructura final
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE
    table_name = 'ComprobantePago'
ORDER BY ordinal_position;

-- 9. Verificar las foreign keys
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE
    tc.table_name = 'ComprobantePago'
    AND tc.constraint_type = 'FOREIGN KEY';

-- Mensaje de confirmación
SELECT 'Tabla ComprobantePago verificada y corregida exitosamente. Lista para almacenar comprobantes PDF en base64.' AS mensaje;