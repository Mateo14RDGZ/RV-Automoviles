-- Script para actualizar las credenciales del administrador
-- Email: marcos@rvautomoviles.com
-- Password: Marcos1985
-- Hash generado con bcrypt (salt rounds: 10)

-- Primero eliminar el usuario de prueba anterior
DELETE FROM "Usuario" WHERE "email" = 'admin@automanager.com';

-- Insertar el nuevo administrador con las nuevas credenciales
INSERT INTO "Usuario" ("email", "password", "rol")
VALUES ('marcos@rvautomoviles.com', '$2a$10$352VcNvl96zujBpUU8xJ5eoz8ls01TALRm3zORxe0TPqYHRHupV2C', 'admin')
ON CONFLICT ("email") DO UPDATE
SET "password" = EXCLUDED."password",
    "rol" = EXCLUDED."rol";

-- Verificar que el usuario se creó correctamente
SELECT "id", "email", "rol", "createdAt" FROM "Usuario" WHERE "email" = 'marcos@rvautomoviles.com';
