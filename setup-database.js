#!/usr/bin/env node
/**
 * Script de verificación y configuración de base de datos
 * Ejecutar con: node setup-database.js
 */

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

async function checkDatabaseConnection() {
  log.info('Verificando conexión a la base de datos...');
  
  if (!process.env.DATABASE_URL) {
    log.error('DATABASE_URL no está configurada en el archivo .env');
    log.warning('Por favor, configura tu DATABASE_URL en el archivo .env');
    log.info('Pasos:');
    log.info('1. Ve a https://console.neon.tech');
    log.info('2. Copia tu Connection String');
    log.info('3. Pégala en el archivo .env como DATABASE_URL');
    process.exit(1);
  }

  if (process.env.DATABASE_URL.includes('usuario:password@ep-xxxxx')) {
    log.error('DATABASE_URL contiene valores de ejemplo');
    log.warning('Necesitas reemplazar la DATABASE_URL con tu conexión real de Neon');
    log.info('Tu DATABASE_URL actual: ' + process.env.DATABASE_URL.substring(0, 50) + '...');
    process.exit(1);
  }

  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    log.success('Conexión a la base de datos exitosa');
    
    // Verificar si las tablas existen
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    log.info(`Tablas encontradas: ${tables.length}`);
    
    if (tables.length === 0) {
      log.warning('No se encontraron tablas en la base de datos');
      log.info('Ejecutando migraciones...');
      
      execSync('npx prisma db push --schema=./api/prisma/schema.prisma', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      log.success('Tablas creadas exitosamente');
    } else {
      log.success(`Base de datos configurada correctamente con ${tables.length} tablas`);
    }
    
    await prisma.$disconnect();
    
    log.success('¡Todo listo! Tu base de datos está correctamente configurada');
    log.info('Los datos se guardarán permanentemente en PostgreSQL (Neon)');
    
  } catch (error) {
    log.error('Error al conectar con la base de datos:');
    console.error(error.message);
    log.warning('Verifica que:');
    log.info('1. Tu DATABASE_URL sea correcta');
    log.info('2. Tengas acceso a internet');
    log.info('3. Tu cuenta de Neon esté activa');
    process.exit(1);
  }
}

checkDatabaseConnection();
