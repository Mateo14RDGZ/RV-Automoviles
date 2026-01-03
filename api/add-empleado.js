require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addEmpleado() {
  try {
    console.log('🔍 Verificando si existe el usuario empleado...');
    
    // Verificar si ya existe
    const existingEmpleado = await prisma.usuario.findFirst({
      where: { email: 'empleado@demo.com' }
    });

    if (existingEmpleado) {
      console.log('⚠️ El usuario empleado ya existe');
      console.log('Email:', existingEmpleado.email);
      console.log('Rol:', existingEmpleado.rol);
      
      // Verificar si la contraseña actual es correcta
      const passwordOk = await bcrypt.compare('admin123', existingEmpleado.password);
      if (passwordOk) {
        console.log('✅ La contraseña actual es correcta (admin123)');
      } else {
        console.log('⚠️ Actualizando contraseña a admin123...');
        const newHash = await bcrypt.hash('admin123', 10);
        await prisma.usuario.update({
          where: { id: existingEmpleado.id },
          data: { password: newHash }
        });
        console.log('✅ Contraseña actualizada correctamente');
      }
      
      return;
    }

    console.log('➕ Creando usuario empleado...');
    
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash('admin123', 10);

    // Crear el empleado
    const empleado = await prisma.usuario.create({
      data: {
        email: 'empleado@demo.com',
        password: passwordHash,
        rol: 'empleado',
      },
    });

    console.log('✅ Usuario empleado creado exitosamente!');
    console.log('📧 Email:', empleado.email);
    console.log('🔐 Contraseña: admin123');
    console.log('👤 Rol:', empleado.rol);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEmpleado();

