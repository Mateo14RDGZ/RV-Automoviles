// Script para regenerar contraseñas aleatorias para clientes existentes
// Ejecutar: node regenerar-passwords-clientes.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function regenerarPasswordsClientes() {
  try {
    console.log('🔄 Iniciando regeneración de contraseñas...\n');

    // Obtener todos los clientes sin passwordTemporal
    const clientesSinPassword = await prisma.cliente.findMany({
      where: {
        passwordTemporal: null
      },
      include: {
        usuario: true
      }
    });

    console.log(`📊 Clientes sin contraseña encontrados: ${clientesSinPassword.length}\n`);

    if (clientesSinPassword.length === 0) {
      console.log('✅ Todos los clientes ya tienen contraseña temporal asignada.');
      return;
    }

    let actualizados = 0;
    let errores = 0;

    for (const cliente of clientesSinPassword) {
      try {
        // Generar contraseña aleatoria de 8 caracteres
        const passwordTemporal = Math.random().toString(36).slice(-8).toUpperCase();
        
        // Hashear la contraseña para el usuario
        const hashedPassword = await bcrypt.hash(passwordTemporal, 10);

        // Actualizar cliente con la contraseña temporal
        await prisma.cliente.update({
          where: { id: cliente.id },
          data: { passwordTemporal }
        });

        // Actualizar usuario con la contraseña hasheada
        if (cliente.usuario) {
          await prisma.usuario.update({
            where: { id: cliente.usuario.id },
            data: { password: hashedPassword }
          });
        }

        console.log(`✅ Cliente ${cliente.nombre} (ID: ${cliente.id})`);
        console.log(`   📧 Usuario: ${cliente.cedula}`);
        console.log(`   🔑 Nueva contraseña: ${passwordTemporal}\n`);

        actualizados++;
      } catch (error) {
        console.error(`❌ Error al actualizar cliente ${cliente.nombre} (ID: ${cliente.id}):`, error.message);
        errores++;
      }
    }

    console.log('\n=====================================');
    console.log('📊 RESUMEN:');
    console.log(`✅ Clientes actualizados: ${actualizados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log('=====================================\n');

    console.log('⚠️  IMPORTANTE: Guarda las contraseñas generadas y envíalas a los clientes por WhatsApp.');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

regenerarPasswordsClientes();
