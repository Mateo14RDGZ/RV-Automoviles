// Script para crear/actualizar admin con las credenciales correctas
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_dTz7KykatCR4@ep-fancy-breeze-adnc6v56-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function actualizarCredencialesAdmin() {
  console.log('🔧 Actualizando credenciales del admin en producción...\n');
  
  try {
    const emailViejo = "admin@rvautomoviles.com";
    const emailNuevo = "admin@automanager.com";
    const passwordNuevo = "admin123";
    
    // Verificar si existe el usuario viejo
    const userViejo = await prisma.usuario.findUnique({
      where: { email: emailViejo }
    });
    
    // Verificar si ya existe el nuevo
    const userNuevo = await prisma.usuario.findUnique({
      where: { email: emailNuevo }
    });
    
    const hashedPassword = await bcrypt.hash(passwordNuevo, 10);
    
    if (userNuevo) {
      // Actualizar el existente
      console.log('✅ Usuario encontrado:', emailNuevo);
      console.log('🔒 Actualizando contraseña...\n');
      
      await prisma.usuario.update({
        where: { email: emailNuevo },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Contraseña actualizada!\n');
    } else if (userViejo) {
      // Actualizar email y contraseña del viejo
      console.log('✅ Actualizando usuario de', emailViejo, 'a', emailNuevo);
      
      await prisma.usuario.update({
        where: { email: emailViejo },
        data: { 
          email: emailNuevo,
          password: hashedPassword 
        }
      });
      
      console.log('✅ Usuario actualizado!\n');
    } else {
      // Crear nuevo
      console.log('🔧 Creando nuevo usuario admin...\n');
      
      await prisma.usuario.create({
        data: {
          email: emailNuevo,
          password: hashedPassword,
          rol: "admin",
        },
      });
      
      console.log('✅ Usuario admin creado!\n');
    }
    
    console.log('📧 Email:', emailNuevo);
    console.log('🔑 Contraseña:', passwordNuevo);
    console.log('\n🧪 Prueba iniciar sesión en: https://rv-gestion-automotora20.vercel.app\n');
    
    // Verificar que el hash funciona
    console.log('🔍 Verificando hash...');
    const isValid = await bcrypt.compare(passwordNuevo, hashedPassword);
    console.log('Hash válido:', isValid ? '✅' : '❌');
    
    // Eliminar el usuario viejo si existe y es diferente
    if (userViejo && userNuevo) {
      console.log('\n🗑️ Eliminando usuario antiguo...');
      await prisma.usuario.delete({
        where: { email: emailViejo }
      });
      console.log('✅ Usuario antiguo eliminado\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nError completo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

actualizarCredencialesAdmin();
