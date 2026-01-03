const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // IMPORTANTE: Verificar si ya existen datos para NO borrarlos
  const existingUsers = await prisma.usuario.count();
  const existingClientes = await prisma.cliente.count();
  const existingAutos = await prisma.auto.count();

  if (existingUsers > 0 || existingClientes > 0 || existingAutos > 0) {
    console.log('⚠️ Ya existen datos en la base de datos.');
    console.log(`  - Usuarios: ${existingUsers}`);
    console.log(`  - Clientes: ${existingClientes}`);
    console.log(`  - Autos: ${existingAutos}`);
    console.log('❌ SEED CANCELADO: Para evitar pérdida de datos, no se ejecutará el seed.');
    console.log('💡 Si deseas resetear la base de datos, debes hacerlo manualmente.');
    return;
  }

  console.log('✅ Base de datos vacía, iniciando seed...');

  // Hash de contraseñas
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // Crear usuarios administradores
  const admin1 = await prisma.usuario.create({
    data: {
      email: 'admin@demo.com',
      password: adminPasswordHash,
      rol: 'admin',
    },
  });

  const admin2 = await prisma.usuario.create({
    data: {
      email: 'demo@demo.com',
      password: adminPasswordHash,
      rol: 'admin',
    },
  });

  // Crear usuario empleado
  const empleado1 = await prisma.usuario.create({
    data: {
      email: 'empleado@demo.com',
      password: adminPasswordHash,
      rol: 'empleado',
    },
  });

  console.log('✅ Usuarios administradores y empleado creados');

  // Crear clientes con sus usuarios
  const cliente1 = await prisma.cliente.create({
    data: {
      nombre: 'Juan Pérez',
      cedula: '12345678',
      telefono: '099123456',
      direccion: 'Av. Italia 1234',
      email: 'juan.perez@email.com',
      activo: true,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'juan.perez@email.com',
      password: await bcrypt.hash('12345678', 10),
      rol: 'cliente',
      clienteId: cliente1.id,
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      nombre: 'María González',
      cedula: '87654321',
      telefono: '099987654',
      direccion: 'Bvar. Artigas 5678',
      email: 'maria.gonzalez@email.com',
      activo: true,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'maria.gonzalez@email.com',
      password: await bcrypt.hash('87654321', 10),
      rol: 'cliente',
      clienteId: cliente2.id,
    },
  });

  const cliente3 = await prisma.cliente.create({
    data: {
      nombre: 'Carlos Rodríguez',
      cedula: '11223344',
      telefono: '099111222',
      direccion: 'Av. 18 de Julio 2345',
      email: 'carlos.rodriguez@email.com',
      activo: true,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'carlos.rodriguez@email.com',
      password: await bcrypt.hash('11223344', 10),
      rol: 'cliente',
      clienteId: cliente3.id,
    },
  });

  const cliente4 = await prisma.cliente.create({
    data: {
      nombre: 'Ana Martínez',
      cedula: '55667788',
      telefono: '099555666',
      direccion: 'Colonia 3456',
      email: 'ana.martinez@email.com',
      activo: true,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'ana.martinez@email.com',
      password: await bcrypt.hash('55667788', 10),
      rol: 'cliente',
      clienteId: cliente4.id,
    },
  });

  console.log('✅ Clientes y usuarios de clientes creados');

  // Crear autos
  const auto1 = await prisma.auto.create({
    data: {
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2020,
      matricula: 'ABC1234',
      precio: 25000,
      estado: 'vendido',
      clienteId: cliente1.id,
      activo: true,
    },
  });

  const auto2 = await prisma.auto.create({
    data: {
      marca: 'Honda',
      modelo: 'Civic',
      anio: 2019,
      matricula: 'DEF5678',
      precio: 22000,
      estado: 'vendido',
      clienteId: cliente2.id,
      activo: true,
    },
  });

  const auto3 = await prisma.auto.create({
    data: {
      marca: 'Ford',
      modelo: 'Focus',
      anio: 2021,
      matricula: 'GHI9012',
      precio: 20000,
      estado: 'vendido',
      clienteId: cliente3.id,
      activo: true,
    },
  });

  const auto4 = await prisma.auto.create({
    data: {
      marca: 'Chevrolet',
      modelo: 'Cruze',
      anio: 2018,
      matricula: 'JKL3456',
      precio: 18000,
      estado: 'vendido',
      clienteId: cliente4.id,
      activo: true,
    },
  });

  const auto5 = await prisma.auto.create({
    data: {
      marca: 'Volkswagen',
      modelo: 'Golf',
      anio: 2022,
      matricula: 'MNO7890',
      precio: 28000,
      estado: 'disponible',
      activo: true,
    },
  });

  const auto6 = await prisma.auto.create({
    data: {
      marca: 'Nissan',
      modelo: 'Sentra',
      anio: 2020,
      matricula: 'PQR1234',
      precio: 21000,
      estado: 'disponible',
      activo: true,
    },
  });

  console.log('✅ Autos creados');

  // Crear pagos para auto1 (Juan Pérez)
  const hoy = new Date();
  const diaMes = 15; // Día del mes para vencimientos

  // Cuotas vencidas (2 meses atrás y 1 mes atrás) - pendientes
  await prisma.pago.create({
    data: {
      autoId: auto1.id,
      numeroCuota: 1,
      monto: 2500,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes),
      estado: 'pendiente',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto1.id,
      numeroCuota: 2,
      monto: 2500,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaMes),
      estado: 'pendiente',
    },
  });

  // Cuota del mes actual - pendiente
  await prisma.pago.create({
    data: {
      autoId: auto1.id,
      numeroCuota: 3,
      monto: 2500,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), diaMes),
      estado: 'pendiente',
    },
  });

  // Cuotas futuras - pendientes
  await prisma.pago.create({
    data: {
      autoId: auto1.id,
      numeroCuota: 4,
      monto: 2500,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 1, diaMes),
      estado: 'pendiente',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto1.id,
      numeroCuota: 5,
      monto: 2500,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 2, diaMes),
      estado: 'pendiente',
    },
  });

  // Crear pagos para auto2 (María González)
  // 1 cuota pagada vencida, 1 vencida pendiente, resto pendientes
  await prisma.pago.create({
    data: {
      autoId: auto2.id,
      numeroCuota: 1,
      monto: 2200,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 3, diaMes),
      fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 3, diaMes + 2),
      estado: 'pagado',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto2.id,
      numeroCuota: 2,
      monto: 2200,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes),
      estado: 'pendiente',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto2.id,
      numeroCuota: 3,
      monto: 2200,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaMes),
      estado: 'pendiente',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto2.id,
      numeroCuota: 4,
      monto: 2200,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), diaMes),
      estado: 'pendiente',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto2.id,
      numeroCuota: 5,
      monto: 2200,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 1, diaMes),
      estado: 'pendiente',
    },
  });

  // Crear pagos para auto3 (Carlos Rodríguez)
  // Todas pagadas
  await prisma.pago.create({
    data: {
      autoId: auto3.id,
      numeroCuota: 1,
      monto: 2000,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 4, diaMes),
      fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 4, diaMes - 1),
      estado: 'pagado',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto3.id,
      numeroCuota: 2,
      monto: 2000,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 3, diaMes),
      fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 3, diaMes - 1),
      estado: 'pagado',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto3.id,
      numeroCuota: 3,
      monto: 2000,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes),
      fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes - 1),
      estado: 'pagado',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto3.id,
      numeroCuota: 4,
      monto: 2000,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaMes),
      fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaMes - 1),
      estado: 'pagado',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto3.id,
      numeroCuota: 5,
      monto: 2000,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), diaMes),
      fechaPago: new Date(hoy.getFullYear(), hoy.getMonth(), diaMes - 1),
      estado: 'pagado',
    },
  });

  // Crear pagos para auto4 (Ana Martínez)
  // Mix de estados
  await prisma.pago.create({
    data: {
      autoId: auto4.id,
      numeroCuota: 1,
      monto: 1800,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes),
      fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes + 5),
      estado: 'pagado',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto4.id,
      numeroCuota: 2,
      monto: 1800,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaMes),
      estado: 'pendiente',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto4.id,
      numeroCuota: 3,
      monto: 1800,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), diaMes),
      estado: 'pendiente',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto4.id,
      numeroCuota: 4,
      monto: 1800,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 1, diaMes),
      estado: 'pendiente',
    },
  });

  await prisma.pago.create({
    data: {
      autoId: auto4.id,
      numeroCuota: 5,
      monto: 1800,
      fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 2, diaMes),
      estado: 'pendiente',
    },
  });

  console.log('✅ Pagos creados');

  // Resumen
  const totalUsuarios = await prisma.usuario.count();
  const totalClientes = await prisma.cliente.count();
  const totalAutos = await prisma.auto.count();
  const totalPagos = await prisma.pago.count();

  console.log('\n📊 Resumen de datos creados:');
  console.log(`   - ${totalUsuarios} usuarios (2 admin + 4 clientes)`);
  console.log(`   - ${totalClientes} clientes`);
  console.log(`   - ${totalAutos} autos (4 vendidos + 2 disponibles)`);
  console.log(`   - ${totalPagos} pagos`);
  console.log('\n✅ Seed completado exitosamente!');
  console.log('\n🔐 Credenciales de prueba:');
  console.log('   Admin: admin@demo.com / admin123');
  console.log('   Admin: demo@demo.com / admin123');
  console.log('   Cliente: 12345678 (Juan Pérez)');
  console.log('   Cliente: 87654321 (María González)');
  console.log('   Cliente: 11223344 (Carlos Rodríguez)');
  console.log('   Cliente: 55667788 (Ana Martínez)');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
