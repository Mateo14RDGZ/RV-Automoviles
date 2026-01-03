-- ==========================================
-- CREAR USUARIO EMPLEADO
-- ==========================================
-- 
-- Este script crea el usuario empleado para acceso limitado al sistema
-- 
-- Credenciales:
--   Email: empleado@demo.com
--   Password: admin123
--   Rol: empleado
--
-- Permisos:
--   ✅ Autos (ver, crear, editar, eliminar)
--   ✅ Clientes (ver, crear, editar, eliminar)
--   ✅ Pagos (ver, registrar, generar cuotas)
--   ❌ Dashboard (NO tiene acceso - sin información monetaria)
--   ❌ Reportes (NO tiene acceso)
--
-- ==========================================

-- Paso 1: Eliminar usuario empleado existente si hay alguno (evitar duplicados)
DELETE FROM "Usuario" WHERE email = 'empleado@demo.com';

-- Paso 2: Crear nuevo usuario empleado con contraseña hasheada
INSERT INTO "Usuario" ("email", "password", "rol", "createdAt", "updatedAt")
VALUES ('empleado@demo.com', '$2a$10$za6C0z3r1/zSTmZvppv6m.utKMo2E0TGGRuF6aszEA7jVlBGB7XS2', 'empleado', NOW(), NOW());

-- Paso 3: Verificar que se creó correctamente
SELECT 
  id, 
  email, 
  rol, 
  "createdAt", 
  "updatedAt" 
FROM "Usuario" 
WHERE email = 'empleado@demo.com';

-- ==========================================
-- FIN DEL SCRIPT
-- ==========================================

