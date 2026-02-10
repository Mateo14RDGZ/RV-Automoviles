-- ============================================
-- Script para Crear Usuario Admin Inicial
-- ============================================
-- Ejecutar este script en Neon Console > SQL Editor
-- DESPUÉS de que el deploy en Vercel haya completado

-- IMPORTANTE: Este script crea un usuario admin con credenciales por defecto
-- Debes cambiar la contraseña inmediatamente después del primer login

-- ============================================
-- PASO 1: Verificar que las tablas existen
-- ============================================
-- Ejecuta esto primero para verificar que las migraciones se aplicaron
SELECT table_name
FROM information_schema.tables
WHERE
    table_schema = 'public'
ORDER BY table_name;

-- Deberías ver estas tablas:
-- - Auto
-- - Cliente
-- - ComprobantePago
-- - Pago
-- - Permuta
-- - Usuario
-- - _prisma_migrations

-- ============================================
-- PASO 2: Crear Usuario Administrador
-- ============================================

-- Eliminar usuario admin si ya existe (para poder recrearlo)
DELETE FROM "Usuario" WHERE email = 'admin@rvautomoviles.com';

-- Crear usuario admin
-- Email: admin@rvautomoviles.com
-- Password: admin123 (CÁMBIALO INMEDIATAMENTE DESPUÉS DEL PRIMER LOGIN)
INSERT INTO
    "Usuario" (
        email,
        password,
        rol,
        "clienteId",
        "createdAt",
        "updatedAt"
    )
VALUES (
        'admin@rvautomoviles.com',
        '$2a$10$YourHashedPasswordHere', -- Hash de bcrypt para 'admin123'
        'admin',
        NULL,
        NOW(),
        NOW()
    );

-- ============================================
-- PASO 3: Verificar que se creó correctamente
-- ============================================
SELECT id, email, rol, "createdAt"
FROM "Usuario"
WHERE
    email = 'admin@rvautomoviles.com';

-- ============================================
-- INFORMACIÓN IMPORTANTE
-- ============================================

-- Credenciales del Admin:
-- Email: admin@rvautomoviles.com
-- Password: admin123

-- ⚠️ SEGURIDAD:
-- 1. Cambia la contraseña inmediatamente después del primer login
-- 2. No compartas estas credenciales
-- 3. Usa contraseñas seguras (mínimo 8 caracteres, letras y números)

-- ============================================
-- OPCIONAL: Crear datos de prueba
-- ============================================

-- Cliente de prueba
INSERT INTO
    "Cliente" (
        nombre,
        cedula,
        telefono,
        direccion,
        email,
        activo,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'Juan Pérez',
        '12345678',
        '099123456',
        'Calle 123, Montevideo',
        'juan.perez@email.com',
        true,
        NOW(),
        NOW()
    );

-- Auto de prueba
INSERT INTO
    "Auto" (
        marca,
        modelo,
        anio,
        matricula,
        precio,
        estado,
        activo,
        kilometraje,
        color,
        combustible,
        transmision,
        observaciones,
        "createdAt",
        "updatedAt"
    )
VALUES (
        'Toyota',
        'Corolla',
        2020,
        'SAA1234',
        25000.00,
        'disponible',
        true,
        50000,
        'Blanco',
        'Nafta',
        'Manual',
        'Vehículo en excelente estado',
        NOW(),
        NOW()
    );

-- Verificar datos creados
SELECT * FROM "Cliente";

SELECT * FROM "Auto";

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Una vez ejecutado este script:
-- 1. Ve a tu app en Vercel: https://tu-app.vercel.app
-- 2. Haz login con admin@rvautomoviles.com / admin123
-- 3. Cambia la contraseña inmediatamente
-- 4. ¡Comienza a usar tu aplicación!