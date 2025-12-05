// Datos de demostración para la versión sin base de datos
// Este archivo contiene todos los datos de ejemplo que se usarán en la demo

// Usuario admin de demostración
// Contraseña: admin123
const usuarios = [
  {
    id: 1,
    email: 'admin@demo.com',
    password: '$2a$10$ln.v2lFJmyIbBy/9s5X88eZ2wRuRwEVTiesB5Zmw.86kqJnPLCCa.', // admin123
    rol: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    email: 'demo@demo.com',
    password: '$2a$10$ln.v2lFJmyIbBy/9s5X88eZ2wRuRwEVTiesB5Zmw.86kqJnPLCCa.', // admin123
    rol: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  // Usuarios para clientes (pueden ver sus cuotas)
  {
    id: 3,
    email: 'juan.perez@email.com',
    password: '$2a$10$ln.v2lFJmyIbBy/9s5X88eZ2wRuRwEVTiesB5Zmw.86kqJnPLCCa.', // admin123 (mismo hash para demo)
    rol: 'cliente',
    clienteId: 1,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 4,
    email: 'maria.gonzalez@email.com',
    password: '$2a$10$ln.v2lFJmyIbBy/9s5X88eZ2wRuRwEVTiesB5Zmw.86kqJnPLCCa.', // admin123
    rol: 'cliente',
    clienteId: 2,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 5,
    email: 'carlos.rodriguez@email.com',
    password: '$2a$10$ln.v2lFJmyIbBy/9s5X88eZ2wRuRwEVTiesB5Zmw.86kqJnPLCCa.', // admin123
    rol: 'cliente',
    clienteId: 3,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: 6,
    email: 'ana.martinez@email.com',
    password: '$2a$10$ln.v2lFJmyIbBy/9s5X88eZ2wRuRwEVTiesB5Zmw.86kqJnPLCCa.', // admin123
    rol: 'cliente',
    clienteId: 4,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  }
];

// Clientes de ejemplo
const clientes = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    cedula: '12345678',
    email: 'juan.perez@email.com',
    telefono: '099123456',
    direccion: 'Av. Principal 123',
    usuarioId: 3,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 2,
    nombre: 'María González',
    cedula: '87654321',
    email: 'maria.gonzalez@email.com',
    telefono: '099876543',
    direccion: 'Calle Secundaria 456',
    usuarioId: 4,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 3,
    nombre: 'Carlos Rodríguez',
    cedula: '11223344',
    email: 'carlos.rodriguez@email.com',
    telefono: '099334455',
    direccion: 'Bulevar Este 789',
    usuarioId: 5,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: 4,
    nombre: 'Ana Martínez',
    cedula: '55667788',
    email: 'ana.martinez@email.com',
    telefono: '099667788',
    direccion: 'Av. Central 321',
    usuarioId: 6,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  }
];

// Autos de ejemplo
const autos = [
  {
    id: 1,
    marca: 'Toyota',
    modelo: 'Corolla',
    anio: 2020,
    matricula: 'ABC1234',
    precio: 25000,
    entrada: 5000,
    saldo: 20000,
    cuotas: 24,
    montoCuota: 833.33,
    estado: 'disponible',
    clienteId: null,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 2,
    marca: 'Honda',
    modelo: 'Civic',
    anio: 2021,
    matricula: 'DEF5678',
    precio: 28000,
    entrada: 8000,
    saldo: 15000,
    cuotas: 36,
    montoCuota: 416.67,
    estado: 'vendido',
    clienteId: 1,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 3,
    marca: 'Chevrolet',
    modelo: 'Onix',
    anio: 2022,
    matricula: 'GHI9012',
    precio: 22000,
    entrada: 4000,
    saldo: 18000,
    cuotas: 30,
    montoCuota: 600,
    estado: 'vendido',
    clienteId: 2,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-10')
  },
  {
    id: 4,
    marca: 'Volkswagen',
    modelo: 'Golf',
    anio: 2019,
    matricula: 'JKL3456',
    precio: 24000,
    entrada: 6000,
    saldo: 18000,
    cuotas: 24,
    montoCuota: 750,
    estado: 'reservado',
    clienteId: 3,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: 5,
    marca: 'Ford',
    modelo: 'Focus',
    anio: 2021,
    matricula: 'MNO7890',
    precio: 26000,
    entrada: 7000,
    saldo: 12000,
    cuotas: 36,
    montoCuota: 333.33,
    estado: 'vendido',
    clienteId: 4,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-10')
  },
  {
    id: 6,
    marca: 'Nissan',
    modelo: 'Sentra',
    anio: 2020,
    matricula: 'PQR2345',
    precio: 23000,
    entrada: 5000,
    saldo: 18000,
    cuotas: 30,
    montoCuota: 600,
    estado: 'disponible',
    clienteId: null,
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  }
];

// Pagos de ejemplo
const pagos = [
  // Pagos de Juan Pérez (Cliente 1, Auto 2 - Honda Civic)
  {
    id: 1,
    clienteId: 1,
    autoId: 2,
    numeroCuota: 1,
    monto: 416.67,
    fechaPago: new Date('2024-02-05'),
    fechaVencimiento: new Date('2024-02-01'),
    estado: 'pagado',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: 2,
    clienteId: 1,
    autoId: 2,
    numeroCuota: 2,
    monto: 416.67,
    fechaPago: new Date('2024-03-03'),
    fechaVencimiento: new Date('2024-03-01'),
    estado: 'pagado',
    createdAt: new Date('2024-03-03'),
    updatedAt: new Date('2024-03-03')
  },
  {
    id: 3,
    clienteId: 1,
    autoId: 2,
    numeroCuota: 3,
    monto: 416.67,
    fechaPago: new Date('2024-04-02'),
    fechaVencimiento: new Date('2024-04-01'),
    estado: 'pagado',
    createdAt: new Date('2024-04-02'),
    updatedAt: new Date('2024-04-02')
  },
  {
    id: 4,
    clienteId: 1,
    autoId: 2,
    numeroCuota: 4,
    monto: 416.67,
    fechaPago: null,
    fechaVencimiento: new Date('2024-05-01'),
    estado: 'pendiente',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  },
  
  // Pagos de María González (Cliente 2, Auto 3 - Chevrolet Onix)
  {
    id: 5,
    clienteId: 2,
    autoId: 3,
    numeroCuota: 1,
    monto: 600,
    fechaPago: new Date('2024-02-15'),
    fechaVencimiento: new Date('2024-02-10'),
    estado: 'pagado',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    id: 6,
    clienteId: 2,
    autoId: 3,
    numeroCuota: 2,
    monto: 600,
    fechaPago: new Date('2024-03-12'),
    fechaVencimiento: new Date('2024-03-10'),
    estado: 'pagado',
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-03-12')
  },
  {
    id: 7,
    clienteId: 2,
    autoId: 3,
    numeroCuota: 3,
    monto: 600,
    fechaPago: null,
    fechaVencimiento: new Date('2024-04-10'),
    estado: 'pendiente',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  
  // Pagos de Carlos Rodríguez (Cliente 3, Auto 4 - VW Golf)
  {
    id: 8,
    clienteId: 3,
    autoId: 4,
    numeroCuota: 1,
    monto: 750,
    fechaPago: new Date('2024-03-05'),
    fechaVencimiento: new Date('2024-03-01'),
    estado: 'pagado',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05')
  },
  {
    id: 9,
    clienteId: 3,
    autoId: 4,
    numeroCuota: 2,
    monto: 750,
    fechaPago: null,
    fechaVencimiento: new Date('2024-04-01'),
    estado: 'pendiente',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05')
  },
  
  // Pagos de Ana Martínez (Cliente 4, Auto 5 - Ford Focus)
  {
    id: 10,
    clienteId: 4,
    autoId: 5,
    numeroCuota: 1,
    monto: 333.33,
    fechaPago: new Date('2024-03-15'),
    fechaVencimiento: new Date('2024-03-10'),
    estado: 'pagado',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: 11,
    clienteId: 4,
    autoId: 5,
    numeroCuota: 2,
    monto: 333.33,
    fechaPago: new Date('2024-04-12'),
    fechaVencimiento: new Date('2024-04-10'),
    estado: 'pagado',
    createdAt: new Date('2024-04-12'),
    updatedAt: new Date('2024-04-12')
  },
  {
    id: 12,
    clienteId: 4,
    autoId: 5,
    numeroCuota: 3,
    monto: 333.33,
    fechaPago: null,
    fechaVencimiento: new Date('2024-05-10'),
    estado: 'vencido',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15')
  }
];

// Contadores para IDs autoincrementales
let nextClienteId = clientes.length + 1;
let nextAutoId = autos.length + 1;
let nextPagoId = pagos.length + 1;

module.exports = {
  usuarios,
  clientes,
  autos,
  pagos,
  // Funciones helper para manipular datos
  getNextClienteId: () => nextClienteId++,
  getNextAutoId: () => nextAutoId++,
  getNextPagoId: () => nextPagoId++,
  // Función para resetear datos (útil para testing)
  resetData: () => {
    nextClienteId = clientes.length + 1;
    nextAutoId = autos.length + 1;
    nextPagoId = pagos.length + 1;
  }
};
