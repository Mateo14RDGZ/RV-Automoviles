-- =====================================================
-- Script SQL para crear usuarios administrativos en Neon
-- Ejecuta esto en el SQL Editor de Neon DESPUÉS de crear las tablas
-- =====================================================

-- IMPORTANTE: Este script usa hashes de ejemplo para "admin123"
-- Para contraseñas personalizadas, genera tus propios hashes usando:
-- 1. https://bcrypt-generator.com/ (Rounds: 10)
-- 2. O ejecuta: node generate-users-sql.js en la carpeta api/

-- =====================================================
-- ELIMINAR USUARIOS EXISTENTES (opcional - solo si quieres recrearlos)
-- =====================================================
-- DELETE FROM "Usuario" WHERE email IN (
--     'admin@quesadaautomoviles.com',
--     'admin@demo.com',
--     'empleado@quesadaautomoviles.com'
-- );

-- =====================================================
-- USUARIO ADMINISTRADOR PRINCIPAL
-- =====================================================
-- Email: admin@quesadaautomoviles.com
-- Password: admin123 (⚠️ CAMBIAR DESPUÉS DEL PRIMER LOGIN)
-- Rol: admin (acceso completo a todo el sistema)

INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")
VALUES (
    'admin@quesadaautomoviles.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- Hash para: admin123
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- USUARIO ADMINISTRADOR DEMO (compatibilidad)
-- =====================================================
-- Email: admin@demo.com
-- Password: admin123 (⚠️ CAMBIAR DESPUÉS DEL PRIMER LOGIN)
-- Rol: admin

INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")
VALUES (
    'admin@demo.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- Hash para: admin123
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- USUARIO EMPLEADO
-- =====================================================
-- Email: empleado@quesadaautomoviles.com
-- Password: admin123 (⚠️ CAMBIAR DESPUÉS DEL PRIMER LOGIN)
-- Rol: empleado
-- Permisos: Autos (ver, crear, editar, eliminar)
--          Clientes (ver, crear, editar, eliminar)
--          Pagos (ver, registrar, generar cuotas)
--          NO tiene acceso a: Dashboard, Reportes

INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")
VALUES (
    'empleado@quesadaautomoviles.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- Hash para: admin123
    'empleado',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICAR USUARIOS CREADOS
-- =====================================================

SELECT 
    id, 
    email, 
    rol, 
    "createdAt",
    CASE rol
        WHEN 'admin' THEN '✅ Acceso completo'
        WHEN 'empleado' THEN '⚠️ Acceso limitado (sin Dashboard/Reportes)'
        WHEN 'cliente' THEN '👤 Acceso a su información'
        ELSE '❓ Rol desconocido'
    END as permisos
FROM "Usuario" 
ORDER BY 
    CASE rol 
        WHEN 'admin' THEN 1 
        WHEN 'empleado' THEN 2 
        WHEN 'cliente' THEN 3 
        ELSE 4 
    END,
    email;

-- =====================================================
-- INSTRUCCIONES PARA GENERAR HASHES PERSONALIZADOS
-- =====================================================

-- Para generar hashes de contraseñas personalizados:

-- OPCIÓN 1: Usar generador online (MÁS FÁCIL)
-- 1. Ve a: https://bcrypt-generator.com/
-- 2. Ingresa tu contraseña
-- 3. Rounds: 10
-- 4. Click "Generate"
-- 5. Copia el hash y reemplázalo en los INSERTs arriba

-- OPCIÓN 2: Usar el script Node.js (recomendado si tienes Node.js)
-- cd api
-- npm install (si no están instaladas las dependencias)
-- node generate-users-sql.js
-- (Esto generará el SQL completo con hashes válidos)

-- OPCIÓN 3: Generar hash manualmente en Node.js
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('tu-password', 10).then(h => console.log(h));"

-- =====================================================
-- CREDENCIALES POR DEFECTO
-- =====================================================

-- ADMINISTRADOR PRINCIPAL:
--   Email: admin@quesadaautomoviles.com
--   Password: admin123
--   ⚠️ IMPORTANTE: Cambia la contraseña después del primer login

-- ADMINISTRADOR DEMO:
--   Email: admin@demo.com
--   Password: admin123
--   ⚠️ IMPORTANTE: Cambia la contraseña después del primer login

-- EMPLEADO:
--   Email: empleado@quesadaautomoviles.com
--   Password: admin123
--   ⚠️ IMPORTANTE: Cambia la contraseña después del primer login

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
