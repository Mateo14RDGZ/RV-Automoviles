-- AlterTable
-- Remover restricción UNIQUE de la columna matricula para permitir múltiples autos "0km"
DROP INDEX IF EXISTS "Auto_matricula_key";
