-- Script para agregar usuario empleado a la base de datos
-- Este script agrega el usuario empleado si no existe

-- Verificar si ya existe el empleado
DO $$
BEGIN
  -- Verificar si el email ya existe
  IF NOT EXISTS (SELECT 1 FROM "Usuario" WHERE email = 'empleado@demo.com') THEN
    -- Insertar el empleado con contraseña hasheada (admin123)
    -- Hash generado con bcrypt, salt rounds = 10
    INSERT INTO "Usuario" (email, password, rol, "createdAt", "updatedAt")
    VALUES (
      'empleado@demo.com',
      '$2a$10$CwTycUXWue0Thq9StjUM0uJ8qGh.LzKJZ8jK8n8Y8jK8n8Y8jK8n8',
      'empleado',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Usuario empleado creado exitosamente';
  ELSE
    RAISE NOTICE 'El usuario empleado ya existe';
  END IF;
END $$;

