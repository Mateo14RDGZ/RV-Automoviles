-- Migración manual para agregar campo escribana
-- Ejecuta este script en tu base de datos de producción (Neon Dashboard)

-- 1. Agregar la columna escribana a la tabla Auto
ALTER TABLE "Auto" ADD COLUMN IF NOT EXISTS "escribana" TEXT;

-- 2. Registrar la migración en la tabla de migraciones de Prisma
INSERT INTO
    "_prisma_migrations" (
        id,
        checksum,
        finished_at,
        migration_name,
        logs,
        rolled_back_at,
        started_at,
        applied_steps_count
    )
VALUES (
        gen_random_uuid (),
        'e5d8b8f3c2a1d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
        NOW(),
        '20250103000000_add_escribana_to_auto',
        NULL,
        NULL,
        NOW(),
        1
    ) ON CONFLICT (migration_name) DO NOTHING;

-- 3. Verificar que la columna se agregó correctamente
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE
    table_name = 'Auto'
    AND column_name = 'escribana';