-- Script SQL para recrear usuario empleado
-- Ejecutar este script completo en el SQL Editor de Neon
-- Credenciales: empleado@demo.com / admin123

-- Paso 1: Eliminar usuario empleado existente si hay alguno
DELETE FROM "Usuario" WHERE email = 'empleado@demo.com';

-- Paso 2: Crear nuevo usuario empleado
INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")
VALUES (
    'empleado@demo.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Hash bcrypt para: admin123
    'empleado',
    NOW(),
    NOW()
);

-- Paso 3: Verificar que el usuario fue creado correctamente
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

-- Mensaje de confirmación
SELECT 'Usuario empleado recreado exitosamente. Credenciales: empleado@demo.com / admin123' AS resultado;



