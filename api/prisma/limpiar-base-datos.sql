-- ============================================
-- SCRIPT PARA LIMPIAR DATOS DE LA BASE DE DATOS
-- ============================================
-- Este script elimina todos los datos EXCEPTO admin y empleado.
-- Las tablas NO se eliminan, solo su contenido.
-- Ejecutar en Neon Console o cualquier cliente PostgreSQL.

-- ============================================
-- PASO 1: Eliminar comprobantes de pago
-- ============================================
DELETE FROM "ComprobantePago";

-- ============================================
-- PASO 2: Eliminar todos los pagos
-- ============================================
DELETE FROM "Pago";

-- ============================================
-- PASO 3: Eliminar todas las permutas
-- ============================================
DELETE FROM "Permuta";

-- ============================================
-- PASO 4: Eliminar todos los autos
-- ============================================
DELETE FROM "Auto";

-- ============================================
-- PASO 5: Eliminar usuarios de clientes (mantener admin y empleado)
-- ============================================
DELETE FROM "Usuario" WHERE "clienteId" IS NOT NULL;

-- ============================================
-- PASO 6: Eliminar todos los clientes
-- ============================================
DELETE FROM "Cliente";

-- ============================================
-- PASO 7: Reiniciar secuencias (mantener IDs actuales de admin/empleado)
-- ============================================
-- Obtener el próximo ID disponible para clientes
SELECT setval ('"Cliente_id_seq"', 1, false);

-- Obtener el próximo ID disponible para autos
SELECT setval ('"Auto_id_seq"', 1, false);

-- Obtener el próximo ID disponible para pagos
SELECT setval ('"Pago_id_seq"', 1, false);

-- Obtener el próximo ID disponible para permutas
SELECT setval ('"Permuta_id_seq"', 1, false);

-- Obtener el próximo ID disponible para comprobantes
SELECT setval ( '"ComprobantePago_id_seq"', 1, false );

-- Para Usuario, obtener el máximo ID actual y establecer el siguiente
SELECT setval (
        '"Usuario_id_seq"', COALESCE(
            (
                SELECT MAX(id)
                FROM "Usuario"
            ), 0
        ) + 1, false
    );

-- ============================================
-- VERIFICACIÓN: Mostrar usuarios restantes
-- ============================================
SELECT id, email, rol, "createdAt" FROM "Usuario" ORDER BY id;

-- ============================================
-- RESUMEN: Contar registros en cada tabla
-- ============================================
SELECT 'Usuario' as tabla, COUNT(*) as registros, 'MANTENIDOS (admin y empleado)' as nota
FROM "Usuario"
UNION ALL
SELECT 'Cliente', COUNT(*), 'ELIMINADOS'
FROM "Cliente"
UNION ALL
SELECT 'Auto', COUNT(*), 'ELIMINADOS'
FROM "Auto"
UNION ALL
SELECT 'Pago', COUNT(*), 'ELIMINADOS'
FROM "Pago"
UNION ALL
SELECT 'Permuta', COUNT(*), 'ELIMINADOS'
FROM "Permuta"
UNION ALL
SELECT 'ComprobantePago', COUNT(*), 'ELIMINADOS'
FROM "ComprobantePago";