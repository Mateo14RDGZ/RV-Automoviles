const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Cargar .env manualmente si existe
try {
  require('dotenv').config();
} catch (e) {
  console.log('⚠️ dotenv no disponible, usando variables de entorno del sistema');
}

const prisma = new PrismaClient();

async function testClientLogin() {
  console.log('🔍 TEST DE LOGIN DE CLIENTE\n');
  
  try {
    // Listar todos los clientes
    console.log('📋 CLIENTES EN LA BASE DE DATOS:');
    console.log('='.repeat(80));
    
    const clientes = await prisma.cliente.findMany({
      include: {
        usuario: true,
        autos: true
      }
    });
    
    if (clientes.length === 0) {
      console.log('❌ No hay clientes en la base de datos');
      return;
    }
    
    for (const cliente of clientes) {
      console.log(`\n👤 Cliente: ${cliente.nombre}`);
      console.log(`   Cédula: ${cliente.cedula}`);
      console.log(`   Email: ${cliente.email}`);
      console.log(`   Activo: ${cliente.activo ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   Usuario asociado: ${cliente.usuario ? '✅ SÍ' : '❌ NO'}`);
      
      if (cliente.usuario) {
        console.log(`   Usuario ID: ${cliente.usuario.id}`);
        console.log(`   Usuario Email: ${cliente.usuario.email}`);
        console.log(`   Usuario Rol: ${cliente.usuario.rol}`);
      }
      
      console.log(`   Autos: ${cliente.autos.length}`);
      if (cliente.autos.length > 0) {
        cliente.autos.forEach(auto => {
          console.log(`      🚗 ${auto.marca} ${auto.modelo} ${auto.anio} - Estado: ${auto.estado}`);
        });
      }
      
      // Verificar si puede hacer login
      const autosFinanciados = cliente.autos.filter(a => a.estado === 'financiado');
      const puedeLogin = cliente.usuario && autosFinanciados.length > 0;
      
      console.log(`   ${puedeLogin ? '✅ PUEDE HACER LOGIN' : '❌ NO PUEDE HACER LOGIN'}`);
      
      if (!puedeLogin) {
        if (!cliente.usuario) {
          console.log('      ⚠️ Razón: No tiene usuario asociado');
        }
        if (autosFinanciados.length === 0) {
          console.log('      ⚠️ Razón: No tiene autos con estado "financiado"');
        }
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n💡 CLIENTES QUE PUEDEN HACER LOGIN:');
    
    const clientesConAcceso = clientes.filter(c => 
      c.usuario && c.autos.some(a => a.estado === 'financiado')
    );
    
    if (clientesConAcceso.length === 0) {
      console.log('❌ Ningún cliente puede hacer login actualmente');
      console.log('\n📝 Para permitir login, asegúrate de que el cliente:');
      console.log('   1. Tenga un usuario asociado (se crea automáticamente al crear el cliente)');
      console.log('   2. Tenga al menos un auto con estado "financiado"');
    } else {
      clientesConAcceso.forEach(c => {
        console.log(`\n✅ ${c.nombre} (Cédula: ${c.cedula})`);
        console.log(`   Para login usar:`);
        console.log(`   - Usuario: ${c.cedula}`);
        console.log(`   - Contraseña: La que se generó al crear el cliente`);
      });
    }
    
    // Ofrecer simular un login
    console.log('\n' + '='.repeat(80));
    console.log('🧪 SIMULACIÓN DE LOGIN\n');
    
    if (clientesConAcceso.length > 0) {
      const cliente = clientesConAcceso[0];
      console.log(`Intentando simular login con: ${cliente.nombre} (${cliente.cedula})`);
      console.log('⚠️ Nota: Necesitarás la contraseña real para probar el login completo');
      console.log('La contraseña fue generada cuando se creó el cliente y se mostró solo una vez.');
      
      // Mostrar el hash almacenado
      console.log(`\n🔐 Hash de contraseña almacenado: ${cliente.usuario.password.substring(0, 20)}...`);
      
      // Intentar con contraseñas comunes de prueba
      console.log('\n🔍 Probando contraseñas comunes de prueba:');
      const passwordsPrueba = [
        cliente.cedula, // La cédula como contraseña
        'admin123',
        '12345678'
      ];
      
      for (const pwd of passwordsPrueba) {
        const match = await bcrypt.compare(pwd, cliente.usuario.password);
        console.log(`   "${pwd}": ${match ? '✅ COINCIDE' : '❌ No coincide'}`);
        if (match) {
          console.log(`   👉 Puedes usar cédula: ${cliente.cedula} y contraseña: ${pwd}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testClientLogin();

