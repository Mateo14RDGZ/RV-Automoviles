// Script para crear usuario admin en la base de datos de producción (Neon)
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

// Usar las URLs de producción de Neon
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_dTz7KykatCR4@ep-fancy-breeze-adnc6v56-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function crearAdminProduccion() {
  console.log('🔍 Conectando a base de datos de producción (Neon)...\n');
  
  try {
    // Verificar conexión
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexión exitosa a Neon\n');
    
    // Buscar usuarios admin existentes
    const admins = await prisma.usuario.findMany({
      where: { rol: 'admin' }
    });
    
    if (admins.length > 0) {
      console.log(`✅ Se encontraron ${admins.length} usuario(s) admin en producción:`);
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Email: ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Creado: ${admin.createdAt}`);
      });
      
      console.log('\n⚠️ Si no puedes iniciar sesión, puede que hayas olvidado la contraseña.');
      console.log('Puedes eliminar el usuario y crear uno nuevo, o cambiar la contraseña.\n');
    } else {
      console.log('❌ No hay usuarios admin en la base de datos de producción\n');
      console.log('🔧 Creando usuario admin...\n');
      
      const email = "admin@rvautomoviles.com";
      const password = "Admin123!";
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const admin = await prisma.usuario.create({
        data: {
          email,
          password: hashedPassword,
          rol: "admin",
        },
      });
      
      console.log('✅ Usuario admin creado exitosamente en PRODUCCIÓN!\n');
      console.log('📧 Email:', email);
      console.log('🔑 Contraseña:', password);
      console.log('\n⚠️ IMPORTANTE: Guarda estas credenciales.');
      console.log('⚠️ Úsalas para iniciar sesión en: https://rv-gestion-automotora20.vercel.app\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'P1001' || error.code === 'P1000') {
      console.error('\n⚠️ Error de conexión a Neon.');
      console.error('Verifica que:');
      console.error('1. La URL de conexión sea correcta');
      console.error('2. La base de datos en Neon esté activa');
      console.error('3. Tengas conexión a internet\n');
    } else if (error.code === 'P2002') {
      console.error('\n⚠️ El email ya está registrado.');
      console.error('Si no puedes iniciar sesión, puede que hayas olvidado la contraseña.\n');
    } else {
      console.error('\nError completo:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

crearAdminProduccion();
