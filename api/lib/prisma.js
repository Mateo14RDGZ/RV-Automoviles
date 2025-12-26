// Prisma Client - Conexión a PostgreSQL (Neon)
const { PrismaClient } = require('@prisma/client');

const prismaClientSingleton = () => {
  // Usar POSTGRES_PRISMA_URL (Vercel/Neon) o DATABASE_URL como fallback
  const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ ERROR: No hay URL de base de datos configurada');
    console.error('   Configura POSTGRES_PRISMA_URL o DATABASE_URL');
    throw new Error('URL de base de datos no configurada');
  }

  // Si usamos POSTGRES_PRISMA_URL, establecer DATABASE_URL para Prisma
  if (process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  }

  console.log('🔗 Conectando a base de datos:', databaseUrl.substring(0, 30) + '...');

  return new PrismaClient({
    log: ['query', 'error', 'warn', 'info'],
    errorFormat: 'pretty',
  });
};

const globalForPrisma = global;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Verificar conexión al iniciar
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma conectado exitosamente a la base de datos');
  })
  .catch((error) => {
    console.error('❌ Error al conectar Prisma:', error);
  });

module.exports = prisma;
