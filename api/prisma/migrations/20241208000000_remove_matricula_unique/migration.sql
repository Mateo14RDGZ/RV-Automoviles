-- AlterTable
-- Remover restricción UNIQUE de la columna matricula para permitir múltiples autos "0km"

-- Primero intentar eliminar el índice si existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'Auto_matricula_key'
        AND n.nspname = 'public'
    ) THEN
        DROP INDEX "Auto_matricula_key";
    END IF;
END $$;

-- Alternativamente, usar DROP INDEX con IF EXISTS (PostgreSQL 9.5+)
DROP INDEX IF EXISTS "Auto_matricula_key";