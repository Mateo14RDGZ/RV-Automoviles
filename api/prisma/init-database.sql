-- Script para crear las tablas en Neon
-- Ejecuta esto en el SQL Editor de Neon si las tablas no existen

-- Tabla Usuario
CREATE TABLE IF NOT EXISTS "Usuario" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'admin',
    "clienteId" INTEGER UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Cliente
CREATE TABLE IF NOT EXISTS "Cliente" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "direccion" TEXT,
    "email" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Auto
CREATE TABLE IF NOT EXISTS "Auto" (
    "id" SERIAL PRIMARY KEY,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "matricula" TEXT NOT NULL UNIQUE,
    "precio" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'disponible',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "clienteId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tabla Pago
CREATE TABLE IF NOT EXISTS "Pago" (
    "id" SERIAL PRIMARY KEY,
    "autoId" INTEGER NOT NULL,
    "numeroCuota" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("autoId") REFERENCES "Auto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Foreign Key de Usuario a Cliente
ALTER TABLE "Usuario"
ADD CONSTRAINT "Usuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Índices
CREATE INDEX IF NOT EXISTS "idx_auto_matricula" ON "Auto" ("matricula");

CREATE INDEX IF NOT EXISTS "idx_cliente_cedula" ON "Cliente" ("cedula");

CREATE INDEX IF NOT EXISTS "idx_usuario_email" ON "Usuario" ("email");

CREATE INDEX IF NOT EXISTS "idx_pago_estado" ON "Pago" ("estado");

CREATE INDEX IF NOT EXISTS "idx_pago_fechaVencimiento" ON "Pago" ("fechaVencimiento");