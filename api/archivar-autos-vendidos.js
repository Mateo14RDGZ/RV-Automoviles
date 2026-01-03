require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function archivarAutosVendidos() {
  try {
    console.log('🔍 Buscando autos vendidos para archivar...');
    
    // Buscar todos los autos con estado "vendido"
    const autosVendidos = await prisma.auto.findMany({
      where: {
        estado: 'vendido'
      },
      include: {
        cliente: true,
        pagos: true
      }
    });

    console.log(`\n📊 Encontrados ${autosVendidos.length} autos con estado "vendido"\n`);

    if (autosVendidos.length === 0) {
      console.log('✅ No hay autos vendidos para archivar');
      return;
    }

    // Mostrar detalles de los autos que se van a archivar
    console.log('📋 Autos que se archivarán (no aparecerán más en el stock):');
    console.log('─'.repeat(70));
    autosVendidos.forEach((auto, index) => {
      console.log(`${index + 1}. ${auto.marca} ${auto.modelo} ${auto.anio}`);
      console.log(`   Matrícula: ${auto.matricula}`);
      console.log(`   Cliente: ${auto.cliente?.nombre || 'Sin cliente'}`);
      console.log(`   Pagos: ${auto.pagos?.length || 0}`);
      console.log(`   Activo: ${auto.activo}`);
      console.log('');
    });

    console.log('─'.repeat(70));
    console.log('\n⚠️  IMPORTANTE: Estos autos:');
    console.log('   • NO aparecerán más en el stock de Autos');
    console.log('   • SÍ aparecerán en los reportes PDF (historial)');
    console.log('   • Los datos NO se eliminarán de la base de datos\n');

    // Actualizar todos los autos vendidos a activo: false
    const resultado = await prisma.auto.updateMany({
      where: {
        estado: 'vendido'
      },
      data: {
        activo: false
      }
    });

    console.log(`✅ ${resultado.count} autos archivados exitosamente\n`);
    
    // Verificar el resultado
    const autosActivos = await prisma.auto.count({ where: { activo: true } });
    const autosArchivados = await prisma.auto.count({ where: { activo: false } });
    
    console.log('📊 Estado actual del inventario:');
    console.log(`   • Autos activos (visibles en stock): ${autosActivos}`);
    console.log(`   • Autos archivados (solo en reportes): ${autosArchivados}`);
    console.log('\n✨ Proceso completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

archivarAutosVendidos();

