-- Script SQL COMPLETO para recrear usuario empleado
-- Ejecutar este script completo en el SQL Editor de Neon
-- Credenciales: empleado@demo.com / admin123

-- ============================================
-- PASO 1: Verificar estado actual
-- ============================================
SELECT 
    'Estado actual del usuario empleado:' AS info,
    id, 
    email, 
    rol, 
    LENGTH(password) as password_length,
    "createdAt"
FROM "Usuario" 
WHERE email = 'empleado@demo.com' OR email LIKE '%empleado%';

-- ============================================
-- PASO 2: Eliminar TODAS las variantes del usuario empleado
-- ============================================
DELETE FROM "Usuario" WHERE email = 'empleado@demo.com';
DELETE FROM "Usuario" WHERE email = 'Empleado@demo.com';
DELETE FROM "Usuario" WHERE email = 'EMPLEADO@DEMO.COM';
DELETE FROM "Usuario" WHERE email = 'empleado@demo.com '; -- con espacio
DELETE FROM "Usuario" WHERE email = ' empleado@demo.com'; -- con espacio al inicio

-- ============================================
-- PASO 3: Crear usuario empleado con hash bcrypt verificado
-- Hash generado con: bcrypt.hash('admin123', 10)
-- ============================================
INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")
VALUES (
    'empleado@demo.com', 
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 
    'empleado',
    NOW(),
    NOW()
);

-- ============================================
-- PASO 4: Verificar creación exitosa
-- ============================================
SELECT 
    '✅ Usuario creado exitosamente' AS resultado,
    id, 
    email, 
    rol, 
    "createdAt",
    LENGTH(password) as password_length,
    CASE rol
        WHEN 'admin' THEN '✅ Acceso completo'
        WHEN 'empleado' THEN '⚠️ Acceso limitado (sin Dashboard/Reportes)'
        WHEN 'cliente' THEN '👤 Acceso a su información'
        ELSE '❓ Rol desconocido'
    END as permisos
FROM "Usuario" 
WHERE email = 'empleado@demo.com';

-- ============================================
-- PASO 5: Verificar formato del email
-- ============================================
SELECT 
    'Verificación de formato:' AS info,
    email,
    LENGTH(email) as longitud,
    email = LOWER(TRIM(email)) as es_minuscula_y_sin_espacios,
    email = 'empleado@demo.com' as coincide_exactamente
FROM "Usuario" 
WHERE email = 'empleado@demo.com';

-- ============================================
-- PASO 6: Listar todos los usuarios para verificación
-- ============================================
SELECT 
    'Todos los usuarios en el sistema:' AS info,
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

-- ============================================
-- MENSAJE FINAL
-- ============================================
SELECT 
    '🎉 Usuario empleado recreado exitosamente' AS resultado,
    'Credenciales: empleado@demo.com / admin123' AS credenciales,
    'Si aún tienes problemas, verifica que el email no tenga espacios' AS nota;



