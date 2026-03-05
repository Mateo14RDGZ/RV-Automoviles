/**
 * Script para migrar autos con estado 'pagado' a 'vendido'.
 * Ejecutar: node api/migrar-pagado-a-vendido.js
 */
require('dotenv').config();
const prisma = require('./lib/prisma');

async function main() {
  const result = await prisma.auto.updateMany({
    where: { estado: 'pagado' },
    data: { estado: 'vendido' }
  });
  console.log(`✅ ${result.count} autos actualizados de 'pagado' a 'vendido'.`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
