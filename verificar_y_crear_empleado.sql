-- Script para verificar y crear usuario empleado en Neon
-- Ejecutar este script en el SQL Editor de Neon

-- Ver todos los usuarios actuales
SELECT id, email, rol, "createdAt" 
FROM "Usuario" 
ORDER BY "createdAt" DESC;

-- Eliminar usuario empleado si existe (para recrearlo limpio)
DELETE FROM "Usuario" WHERE email = 'empleado@demo.com';

-- Crear usuario empleado con contraseña: admin123
INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")
VALUES (
    'empleado@demo.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Hash bcrypt para: admin123
    'empleado',
    NOW(),
    NOW()
);

-- Verificar que el usuario fue creado correctamente
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
WHERE email = 'empleado@demo.com';

-- Ver todos los usuarios para confirmación
SELECT 
    id, 
    email, 
    rol,
    CASE rol
        WHEN 'admin' THEN '👑'
        WHEN 'empleado' THEN '👤'
        WHEN 'cliente' THEN '🙋'
    END as tipo
FROM "Usuario" 
ORDER BY 
    CASE rol 
        WHEN 'admin' THEN 1 
        WHEN 'empleado' THEN 2 
        WHEN 'cliente' THEN 3 
        ELSE 4 
    END,
    email;

