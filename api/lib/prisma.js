// Database Client - Modo Demo (sin base de datos externa)
// En modo demo, usa datos mock en memoria
// Para producción real, descomentar Prisma y configurar base de datos

const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true' || !process.env.POSTGRES_PRISMA_URL;

let prisma;

if (USE_MOCK_DB) {
  // Modo Demo: Usar base de datos simulada
  console.log('🎭 Modo DEMO activado - Usando datos simulados (sin base de datos externa)');
  prisma = require('../data/mockDatabase');
} else {
  // Modo Producción: Usar Prisma con PostgreSQL
  console.log('🗄️ Modo PRODUCCIÓN - Usando PostgreSQL con Prisma');
  const { PrismaClient } = require('@prisma/client');
  
  const prismaClientSingleton = () => {
    if (!process.env.POSTGRES_PRISMA_URL) {
      console.error('❌ ERROR: POSTGRES_PRISMA_URL no está configurada');
    }
    if (!process.env.POSTGRES_URL_NON_POOLING) {
      console.error('❌ ERROR: POSTGRES_URL_NON_POOLING no está configurada');
    }

    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.POSTGRES_PRISMA_URL,
        },
      },
    });
  };

  const globalForPrisma = global;
  prisma = globalForPrisma.prisma ?? prismaClientSingleton();

  if (process.env.NODE_ENV === 'production') {
    globalForPrisma.prisma = prisma;
  } else {
    globalForPrisma.prisma = prisma;
  }

  // Función helper para asegurar conexión
  if (!prisma.$connect || typeof prisma.$connect !== 'function') {
    prisma.$connect = async () => {
      try {
        if (prisma._connectionState === 'connected') {
          return;
        }
        await prisma.$queryRaw`SELECT 1`;
        prisma._connectionState = 'connected';
        console.log('✅ Prisma Client conectado correctamente');
      } catch (error) {
        prisma._connectionState = 'disconnected';
        console.error('❌ Error conectando Prisma:', error.message);
        throw error;
      }
    };
  }
}

module.exports = prisma;
