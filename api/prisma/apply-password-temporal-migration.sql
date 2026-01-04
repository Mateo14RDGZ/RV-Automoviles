-- Migración: Agregar campo passwordTemporal a la tabla Cliente
-- Ejecuta este script en tu base de datos de producción (Neon Dashboard)

-- 1. Agregar la columna passwordTemporal a la tabla Cliente
ALTER TABLE "Cliente" ADD COLUMN IF NOT EXISTS "passwordTemporal" TEXT;

-- 2. Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Cliente' AND column_name = 'passwordTemporal';

-- NOTA: Los clientes existentes tendrán passwordTemporal = NULL
-- Deberás regenerar las contraseñas para estos clientes o asignarles una contraseña manualmente
-- Ejemplo para asignar una contraseña temporal a clientes existentes:
-- UPDATE "Cliente" SET "passwordTemporal" = 'TEMP1234' WHERE "passwordTemporal" IS NULL;
