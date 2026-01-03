-- Script SQL para crear usuario empleado en Neon
-- Ejecutar este script en el SQL Editor de Neon

-- Eliminar usuario empleado existente si hay alguno (para evitar duplicados)
DELETE FROM "Usuario" WHERE email = 'empleado@demo.com';

-- Crear nuevo usuario empleado
-- Email: empleado@demo.com
-- Password: admin123
-- Hash generado con bcrypt (10 rounds)
INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")
VALUES (
    'empleado@demo.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Hash para: admin123
    'empleado',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

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

-- Mostrar todos los usuarios para verificación
SELECT 
    id, 
    email, 
    rol, 
    "createdAt"
FROM "Usuario" 
ORDER BY 
    CASE rol 
        WHEN 'admin' THEN 1 
        WHEN 'empleado' THEN 2 
        WHEN 'cliente' THEN 3 
        ELSE 4 
    END,
    email;




