-- ============================================
-- SCRIPT PARA LIMPIAR TODA LA BASE DE DATOS
-- ============================================
-- ADVERTENCIA: Este script elimina TODOS los datos de todas las tablas.
-- Úsalo solo para resetear el sistema completamente.
-- Ejecutar en Neon Console o cualquier cliente PostgreSQL.

-- Desactivar temporalmente las restricciones de claves foráneas
SET session_replication_role = 'replica';

-- Eliminar todos los datos de las tablas en orden correcto
-- (de tablas dependientes a tablas principales)

-- 1. Eliminar comprobantes de pago (dependen de Pago)
DELETE FROM "ComprobantePago";

-- 2. Eliminar pagos (dependen de Auto)
DELETE FROM "Pago";

-- 3. Eliminar permutas (dependen de Cliente y Auto)
DELETE FROM "Permuta";

-- 4. Eliminar autos (dependen de Cliente)
DELETE FROM "Auto";

-- 5. Eliminar usuarios (algunos dependen de Cliente, otros no)
DELETE FROM "Usuario" WHERE "clienteId" IS NOT NULL;

-- 6. Eliminar clientes
DELETE FROM "Cliente";

-- 7. Eliminar usuarios restantes (admin y empleado)
DELETE FROM "Usuario";

-- Reactivar las restricciones de claves foráneas
SET session_replication_role = 'origin';

-- Reiniciar las secuencias de IDs (opcional, para que los IDs empiecen desde 1)
ALTER SEQUENCE "Usuario_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Cliente_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Auto_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Pago_id_seq" RESTART WITH 1;
ALTER SEQUENCE "Permuta_id_seq" RESTART WITH 1;
ALTER SEQUENCE "ComprobantePago_id_seq" RESTART WITH 1;

-- Mensaje de confirmación (solo para PostgreSQL 12+)
-- SELECT 'Base de datos limpiada exitosamente. Todas las tablas están vacías.' AS resultado;

