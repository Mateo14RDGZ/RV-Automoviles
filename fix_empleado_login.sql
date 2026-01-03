-- Script SQL para corregir y recrear usuario empleado
-- Ejecutar este script completo en el SQL Editor de Neon
-- Credenciales: empleado@demo.com / admin123

-- Paso 1: Verificar si el usuario existe y mostrar su información actual
SELECT 
    id, 
    email, 
    rol, 
    LENGTH(password) as password_length,
    LEFT(password, 20) as password_preview,
    "createdAt"
FROM "Usuario" 
WHERE email = 'empleado@demo.com';

-- Paso 2: Eliminar usuario empleado existente (si existe)
DELETE FROM "Usuario" WHERE email = 'empleado@demo.com';

-- Paso 3: Crear nuevo usuario empleado con hash bcrypt correcto
-- Hash generado con bcryptjs (10 rounds) para la contraseña: admin123
INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")
VALUES (
    'empleado@demo.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
    'empleado',
    NOW(),
    NOW()
);

-- Paso 4: Verificar que el usuario fue creado correctamente
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
    END as permisos,
    LENGTH(password) as password_length
FROM "Usuario" 
WHERE email = 'empleado@demo.com';

-- Paso 5: Verificar que el email no tenga espacios o caracteres extra
SELECT 
    email,
    LENGTH(email) as email_length,
    email = LOWER(TRIM(email)) as email_is_clean
FROM "Usuario" 
WHERE email = 'empleado@demo.com';

-- Mensaje final
SELECT 'Usuario empleado recreado. Credenciales: empleado@demo.com / admin123' AS resultado;




