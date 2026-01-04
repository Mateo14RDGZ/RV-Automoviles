-- Script para generar contraseñas temporales para clientes existentes
-- Ejecuta este script en tu base de datos de producción (Neon Dashboard)

-- OPCIÓN 1: Usar la cédula como contraseña (simple)
-- UPDATE "Cliente" SET "passwordTemporal" = "cedula" WHERE "passwordTemporal" IS NULL;

-- OPCIÓN 2: Generar contraseñas aleatorias únicas para cada cliente
-- Nota: Este script genera contraseñas simples basadas en la cédula + primeras letras del nombre
-- Puedes reemplazarlas manualmente con contraseñas más seguras si lo deseas

-- Ejemplo: Para un cliente específico
-- UPDATE "Cliente" SET "passwordTemporal" = 'NUEVA_PASS' WHERE id = 1;

-- Para ver qué clientes no tienen contraseña:
SELECT id, nombre, cedula, telefono, "passwordTemporal"
FROM "Cliente"
WHERE "passwordTemporal" IS NULL;

-- Para asignar la cédula como contraseña temporal a todos los clientes sin contraseña:
UPDATE "Cliente" 
SET "passwordTemporal" = "cedula" 
WHERE "passwordTemporal" IS NULL;

-- Verificar que se aplicó correctamente:
SELECT id, nombre, cedula, "passwordTemporal"
FROM "Cliente";
