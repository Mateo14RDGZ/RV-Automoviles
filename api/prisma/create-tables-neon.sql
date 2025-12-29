-- =====================================================
-- Script SQL para crear todas las tablas en Neon
-- Ejecuta esto en el SQL Editor de Neon
-- =====================================================

-- Eliminar tablas si existen (opcional, solo si quieres empezar desde cero)
-- DROP TABLE IF EXISTS "Permuta" CASCADE;
-- DROP TABLE IF EXISTS "Pago" CASCADE;
-- DROP TABLE IF EXISTS "Auto" CASCADE;
-- DROP TABLE IF EXISTS "Usuario" CASCADE;
-- DROP TABLE IF EXISTS "Cliente" CASCADE;

-- =====================================================
-- 1. TABLA Cliente (debe crearse primero por las FK)
-- =====================================================
CREATE TABLE IF NOT EXISTS "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 2. TABLA Usuario
-- =====================================================
CREATE TABLE IF NOT EXISTS "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'admin',
    "clienteId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 3. TABLA Auto
-- =====================================================
CREATE TABLE IF NOT EXISTS "Auto" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "matricula" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'disponible',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "clienteId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Auto_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 4. TABLA Pago
-- =====================================================
CREATE TABLE IF NOT EXISTS "Pago" (
    "id" SERIAL NOT NULL,
    "autoId" INTEGER NOT NULL,
    "numeroCuota" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 5. TABLA Permuta
-- =====================================================
CREATE TABLE IF NOT EXISTS "Permuta" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "autoMarca" TEXT,
    "autoModelo" TEXT,
    "autoAnio" INTEGER,
    "autoMatricula" TEXT,
    "motoMarca" TEXT,
    "motoModelo" TEXT,
    "motoAnio" INTEGER,
    "valorEstimado" DOUBLE PRECISION NOT NULL,
    "valorReal" DOUBLE PRECISION,
    "clienteId" INTEGER NOT NULL,
    "autoVendidoId" INTEGER NOT NULL,
    "notas" TEXT,
    "fechaRecepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Permuta_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- ÍNDICES ÚNICOS
-- =====================================================

-- Índice único para Usuario.clienteId (relación 1 a 1)
CREATE UNIQUE INDEX IF NOT EXISTS "Usuario_clienteId_key" ON "Usuario" ("clienteId");

-- NOTA: No hay índice único en Auto.matricula (removido para permitir múltiples autos 0km)

-- =====================================================
-- FOREIGN KEYS (Claves Foráneas)
-- =====================================================

-- Usuario -> Cliente
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Usuario_clienteId_fkey'
    ) THEN
        ALTER TABLE "Usuario"
        ADD CONSTRAINT "Usuario_clienteId_fkey" 
        FOREIGN KEY ("clienteId") 
        REFERENCES "Cliente" ("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;

END IF;

END $$;

-- Auto -> Cliente
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Auto_clienteId_fkey'
    ) THEN
        ALTER TABLE "Auto"
        ADD CONSTRAINT "Auto_clienteId_fkey" 
        FOREIGN KEY ("clienteId") 
        REFERENCES "Cliente" ("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Pago -> Auto
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Pago_autoId_fkey'
    ) THEN
        ALTER TABLE "Pago"
        ADD CONSTRAINT "Pago_autoId_fkey" 
        FOREIGN KEY ("autoId") 
        REFERENCES "Auto" ("id") 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Permuta -> Cliente
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Permuta_clienteId_fkey'
    ) THEN
        ALTER TABLE "Permuta"
        ADD CONSTRAINT "Permuta_clienteId_fkey" 
        FOREIGN KEY ("clienteId") 
        REFERENCES "Cliente" ("id") 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Permuta -> Auto (autoVendidoId)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Permuta_autoVendidoId_fkey'
    ) THEN
        ALTER TABLE "Permuta"
        ADD CONSTRAINT "Permuta_autoVendidoId_fkey" 
        FOREIGN KEY ("autoVendidoId") 
        REFERENCES "Auto" ("id") 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN (Opcionales pero recomendados)
-- =====================================================

CREATE INDEX IF NOT EXISTS "idx_cliente_cedula" ON "Cliente" ("cedula");

CREATE INDEX IF NOT EXISTS "idx_cliente_activo" ON "Cliente" ("activo");

CREATE INDEX IF NOT EXISTS "idx_usuario_email" ON "Usuario" ("email");

CREATE INDEX IF NOT EXISTS "idx_auto_clienteId" ON "Auto" ("clienteId");

CREATE INDEX IF NOT EXISTS "idx_auto_estado" ON "Auto" ("estado");

CREATE INDEX IF NOT EXISTS "idx_auto_activo" ON "Auto" ("activo");

CREATE INDEX IF NOT EXISTS "idx_pago_autoId" ON "Pago" ("autoId");

CREATE INDEX IF NOT EXISTS "idx_pago_estado" ON "Pago" ("estado");

CREATE INDEX IF NOT EXISTS "idx_pago_fechaVencimiento" ON "Pago" ("fechaVencimiento");

CREATE INDEX IF NOT EXISTS "idx_permuta_clienteId" ON "Permuta" ("clienteId");

CREATE INDEX IF NOT EXISTS "idx_permuta_autoVendidoId" ON "Permuta" ("autoVendidoId");

-- =====================================================
-- VERIFICACIÓN (opcional, para confirmar que todo está creado)
-- =====================================================

-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_type = 'BASE TABLE'
-- ORDER BY table_name;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================