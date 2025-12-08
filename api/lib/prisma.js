// Prisma Client - Conexión a PostgreSQL (Neon)
const { PrismaClient } = require('@prisma/client');

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está configurada');
    throw new Error('DATABASE_URL no está configurada');
  }

  console.log('🔗 Conectando a base de datos:', process.env.DATABASE_URL.substring(0, 30) + '...');

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
