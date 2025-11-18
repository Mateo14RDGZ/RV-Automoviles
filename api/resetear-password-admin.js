// Script para actualizar/resetear la contraseña del admin en producción
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_dTz7KykatCR4@ep-fancy-breeze-adnc6v56-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function resetearPasswordAdmin() {
  console.log('🔧 Reseteando contraseña del admin en producción...\n');
  
  try {
    const email = "admin@rvautomoviles.com";
    const newPassword = "Admin123!";
    
    // Verificar que el usuario existe
    const user = await prisma.usuario.findUnique({
      where: { email }
    });
    
    if (!user) {
      console.log('❌ No se encontró el usuario:', email);
      console.log('Ejecuta primero: node crear-admin-produccion.js\n');
      return;
    }
    
    console.log('✅ Usuario encontrado:', email);
    console.log('🔒 Generando nuevo hash de contraseña...\n');
    
    // Generar nuevo hash
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña
    await prisma.usuario.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Contraseña actualizada exitosamente!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Nueva contraseña:', newPassword);
    console.log('\n🧪 Prueba iniciar sesión en: https://rv-gestion-automotora20.vercel.app\n');
    
    // Verificar que el hash funciona
    console.log('🔍 Verificando hash...');
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log('Hash válido:', isValid ? '✅' : '❌');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nError completo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetearPasswordAdmin();
