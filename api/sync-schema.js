#!/usr/bin/env node

/**
 * Script para aplicar cambios de schema en producción sin usar migraciones
 * Útil cuando la base de datos ya existe y tiene datos
 */

const { execSync } = require('child_process');

console.log('🔄 Sincronizando schema de Prisma con la base de datos...\n');

// Mapear POSTGRES_PRISMA_URL a DATABASE_URL si es necesario (para Vercel/Neon)
if (process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  console.log('✅ Usando POSTGRES_PRISMA_URL como DATABASE_URL');
}

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL no configurada, saltando sincronización de schema');
  console.log('⚠️  Continuando con el build...');
  process.exit(0);
}

try {
  // Usar db push en lugar de migrate para bases de datos existentes
  // --accept-data-loss es necesario porque estamos removiendo un constraint
  execSync('npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env
  });
  
  console.log('\n✅ Schema sincronizado exitosamente');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Error al sincronizar schema:', error.message);
  console.log('\n⚠️  Continuando con el build...');
  // No fallar el build, solo advertir
  process.exit(0);
}
