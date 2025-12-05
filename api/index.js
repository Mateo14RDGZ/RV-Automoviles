const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();

// Middleware
app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP'
});

app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cargar Prisma client (mock o real según configuración)
const prisma = require('./lib/prisma');

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Registro de usuario
app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
    }

    const { email, password } = req.body;

    const existingUser = await prisma.usuario.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        rol: 'admin'
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login admin
app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
    }

    const { email, password } = req.body;

    const user = await prisma.usuario.findFirst({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Login cliente
app.post('/api/auth/login-cliente', [
  body('cedula').trim().isLength({ min: 8, max: 13 }).isNumeric().withMessage('La cédula debe tener entre 8 y 13 dígitos numéricos')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
    }

    const { cedula } = req.body;

    const cliente = await prisma.cliente.findFirst({
      where: { cedula },
      include: { usuario: true }
    });

    if (!cliente || !cliente.usuario) {
      return res.status(401).json({ error: 'Cliente no encontrado o sin acceso' });
    }

    const validPassword = await bcrypt.compare(cedula, cliente.usuario.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Cédula incorrecta' });
    }

    const token = jwt.sign(
      {
        id: cliente.usuario.id,
        email: cliente.usuario.email,
        rol: cliente.usuario.rol,
        clienteId: cliente.id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: cliente.usuario.id,
        email: cliente.usuario.email,
        rol: cliente.usuario.rol,
        clienteId: cliente.id,
        nombre: cliente.nombre
      }
    });
  } catch (error) {
    console.error('Error en login cliente:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Verificar token
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: { cliente: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ error: 'Error al verificar token' });
  }
});

// ==================== RUTAS DE AUTOS ====================

app.get('/api/autos', authenticateToken, async (req, res) => {
  try {
    const { estado, clienteId } = req.query;
    const where = {};

    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = parseInt(clienteId);

    const autos = await prisma.auto.findMany({
      where,
      include: {
        cliente: true,
        pagos: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(autos);
  } catch (error) {
    console.error('Error obteniendo autos:', error);
    res.status(500).json({ error: 'Error al obtener autos' });
  }
});

app.get('/api/autos/:id', authenticateToken, async (req, res) => {
  try {
    const auto = await prisma.auto.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        cliente: true,
        pagos: { orderBy: { numeroCuota: 'asc' } }
      }
    });

    if (!auto) {
      return res.status(404).json({ error: 'Auto no encontrado' });
    }

    res.json(auto);
  } catch (error) {
    console.error('Error obteniendo auto:', error);
    res.status(500).json({ error: 'Error al obtener auto' });
  }
});

app.post('/api/autos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { marca, modelo, anio, matricula, precio, estado, clienteId } = req.body;

    const auto = await prisma.auto.create({
      data: {
        marca,
        modelo,
        anio: parseInt(anio),
        matricula,
        precio: parseFloat(precio),
        estado: estado || 'disponible',
        clienteId: clienteId ? parseInt(clienteId) : null
      },
      include: { cliente: true }
    });

    res.status(201).json(auto);
  } catch (error) {
    console.error('Error creando auto:', error);
    res.status(500).json({ error: 'Error al crear auto' });
  }
});

app.put('/api/autos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { marca, modelo, anio, matricula, precio, estado, clienteId } = req.body;

    const auto = await prisma.auto.update({
      where: { id: parseInt(req.params.id) },
      data: {
        marca,
        modelo,
        anio: parseInt(anio),
        matricula,
        precio: parseFloat(precio),
        estado,
        clienteId: clienteId ? parseInt(clienteId) : null
      },
      include: { cliente: true }
    });

    res.json(auto);
  } catch (error) {
    console.error('Error actualizando auto:', error);
    res.status(500).json({ error: 'Error al actualizar auto' });
  }
});

app.delete('/api/autos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.auto.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Auto eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando auto:', error);
    res.status(500).json({ error: 'Error al eliminar auto' });
  }
});

// ==================== RUTAS DE CLIENTES ====================

app.get('/api/clientes', authenticateToken, async (req, res) => {
  try {
    const { activo } = req.query;
    const where = {};

    if (activo !== undefined) where.activo = activo === 'true';

    const clientes = await prisma.cliente.findMany({
      where,
      include: {
        autos: true,
        usuario: { select: { id: true, email: true, rol: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(clientes);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

app.get('/api/clientes/:id', authenticateToken, async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        autos: { include: { pagos: true } },
        usuario: { select: { id: true, email: true, rol: true } }
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

app.post('/api/clientes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, cedula, telefono, direccion, email } = req.body;

    const hashedPassword = await bcrypt.hash(cedula, 10);

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        cedula,
        telefono,
        direccion,
        email,
        usuario: {
          create: {
            email: email || `${cedula}@cliente.com`,
            password: hashedPassword,
            rol: 'cliente'
          }
        }
      },
      include: {
        usuario: { select: { id: true, email: true, rol: true } }
      }
    });

    res.status(201).json(cliente);
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

app.put('/api/clientes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, cedula, telefono, direccion, email, activo } = req.body;

    const cliente = await prisma.cliente.update({
      where: { id: parseInt(req.params.id) },
      data: { nombre, cedula, telefono, direccion, email, activo },
      include: { usuario: { select: { id: true, email: true, rol: true } } }
    });

    res.json(cliente);
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

app.delete('/api/clientes/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.cliente.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

// ==================== RUTAS DE PAGOS ====================

app.get('/api/pagos', authenticateToken, async (req, res) => {
  try {
    const { estado, vencidos, autoId } = req.query;
    const where = {};

    if (req.user.rol === 'cliente' && req.user.clienteId) {
      where.auto = { clienteId: req.user.clienteId };
    }

    if (autoId) where.autoId = parseInt(autoId);

    if (vencidos === 'true') {
      // Vencidas: estado pendiente Y fecha vencida
      where.estado = 'pendiente';
      where.fechaVencimiento = { lt: new Date() };
    } else if (estado === 'pendiente') {
      // Pendientes: estado pendiente PERO fecha NO vencida
      where.estado = 'pendiente';
      where.fechaVencimiento = { gte: new Date() };
    } else if (estado) {
      // Pagadas u otros estados
      where.estado = estado;
    }

    const pagos = await prisma.pago.findMany({
      where,
      include: {
        auto: { include: { cliente: true } }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { numeroCuota: 'asc' }
      ]
    });

    res.json(pagos);
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

app.get('/api/pagos/:id', authenticateToken, async (req, res) => {
  try {
    const pago = await prisma.pago.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { auto: { include: { cliente: true } } }
    });

    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    res.json(pago);
  } catch (error) {
    console.error('Error obteniendo pago:', error);
    res.status(500).json({ error: 'Error al obtener pago' });
  }
});

app.post('/api/pagos/generar-cuotas', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { autoId, numeroCuotas, montoPorCuota, fechaPrimeraCuota } = req.body;

    const auto = await prisma.auto.findUnique({ where: { id: parseInt(autoId) } });
    if (!auto) {
      return res.status(404).json({ error: 'Auto no encontrado' });
    }

    const pagos = [];
    for (let i = 1; i <= numeroCuotas; i++) {
      const fechaVencimiento = new Date(fechaPrimeraCuota);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (i - 1));

      pagos.push({
        autoId: parseInt(autoId),
        numeroCuota: i,
        monto: parseFloat(montoPorCuota),
        fechaVencimiento,
        estado: 'pendiente'
      });
    }

    const createdPagos = await Promise.all(
      pagos.map(pago => prisma.pago.create({ data: pago }))
    );

    await prisma.auto.update({
      where: { id: parseInt(autoId) },
      data: { estado: 'vendido' }
    });

    res.status(201).json(createdPagos);
  } catch (error) {
    console.error('Error generando cuotas:', error);
    res.status(500).json({ error: 'Error al generar cuotas' });
  }
});

app.put('/api/pagos/:id/registrar-pago', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pago = await prisma.pago.update({
      where: { id: parseInt(req.params.id) },
      data: {
        estado: 'pagado',
        fechaPago: new Date()
      },
      include: { auto: { include: { cliente: true } } }
    });

    res.json(pago);
  } catch (error) {
    console.error('Error registrando pago:', error);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
});

app.delete('/api/pagos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await prisma.pago.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Pago eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando pago:', error);
    res.status(500).json({ error: 'Error al eliminar pago' });
  }
});

// ==================== RUTAS DE DASHBOARD ====================

app.get('/api/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalClientes = await prisma.cliente.count({ where: { activo: true } });
    const totalAutos = await prisma.auto.count();
    const autosDisponibles = await prisma.auto.count({ where: { estado: 'disponible' } });
    const autosVendidos = await prisma.auto.count({ where: { estado: 'vendido' } });
    const autosReservados = await prisma.auto.count({ where: { estado: 'reservado' } });

    const pagosPendientes = await prisma.pago.count({ where: { estado: 'pendiente' } });
    const pagosVencidos = await prisma.pago.count({
      where: {
        estado: 'pendiente',
        fechaVencimiento: { lt: new Date() }
      }
    });
    const pagosPagados = await prisma.pago.count({ where: { estado: 'pagado' } });

    const totalPendiente = await prisma.pago.aggregate({
      where: { estado: 'pendiente' },
      _sum: { monto: true }
    });

    const totalRecaudado = await prisma.pago.aggregate({
      where: { estado: 'pagado' },
      _sum: { monto: true }
    });

    // Próximos vencimientos (próximos 7 días)
    const hoy = new Date();
    const en7Dias = new Date();
    en7Dias.setDate(hoy.getDate() + 7);

    const proximosVencimientos = await prisma.pago.findMany({
      where: {
        estado: 'pendiente',
        fechaVencimiento: {
          gte: hoy,
          lte: en7Dias
        }
      },
      include: {
        auto: {
          include: {
            cliente: true
          }
        }
      },
      orderBy: { fechaVencimiento: 'asc' },
      take: 5
    });

    // Pagos recientes (últimos 5)
    const pagosRecientes = await prisma.pago.findMany({
      where: {
        estado: 'pagado',
        fechaPago: { not: null }
      },
      include: {
        auto: {
          include: {
            cliente: true
          }
        }
      },
      orderBy: { fechaPago: 'desc' },
      take: 5
    });

    res.json({
      clientes: {
        total: totalClientes
      },
      autos: {
        total: totalAutos,
        disponibles: autosDisponibles,
        vendidos: autosVendidos,
        reservados: autosReservados
      },
      pagos: {
        pendientes: pagosPendientes,
        vencidos: pagosVencidos,
        pagados: pagosPagados,
        totalPendiente: totalPendiente._sum.monto || 0,
        totalRecaudado: totalRecaudado._sum.monto || 0
      },
      proximosVencimientos,
      pagosRecientes
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// ==================== RUTAS DE UTILIDAD ====================

// Setup automático de base de datos
app.post('/api/setup', async (req, res) => {
  try {
    console.log('🔧 Iniciando setup de base de datos...');
    
    // Verificar si ya hay datos
    const usuariosCount = await prisma.usuario.count();
    if (usuariosCount > 0) {
      return res.json({
        success: true,
        message: 'La base de datos ya tiene datos configurados',
        usuarios: usuariosCount
      });
    }

    console.log('📊 Base de datos vacía, creando datos iniciales...');

    // Hash de contraseñas
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    // Crear usuarios administradores
    await prisma.usuario.create({
      data: { email: 'admin@demo.com', password: adminPasswordHash, rol: 'admin' }
    });

    await prisma.usuario.create({
      data: { email: 'demo@demo.com', password: adminPasswordHash, rol: 'admin' }
    });

    // Crear clientes con sus usuarios
    const cliente1 = await prisma.cliente.create({
      data: {
        nombre: 'Juan Pérez',
        cedula: '12345678',
        telefono: '099123456',
        direccion: 'Av. Italia 1234',
        email: 'juan.perez@email.com',
        activo: true,
      }
    });

    await prisma.usuario.create({
      data: {
        email: 'juan.perez@email.com',
        password: await bcrypt.hash('12345678', 10),
        rol: 'cliente',
        clienteId: cliente1.id
      }
    });

    const cliente2 = await prisma.cliente.create({
      data: {
        nombre: 'María González',
        cedula: '87654321',
        telefono: '099987654',
        direccion: 'Bvar. Artigas 5678',
        email: 'maria.gonzalez@email.com',
        activo: true,
      }
    });

    await prisma.usuario.create({
      data: {
        email: 'maria.gonzalez@email.com',
        password: await bcrypt.hash('87654321', 10),
        rol: 'cliente',
        clienteId: cliente2.id
      }
    });

    const cliente3 = await prisma.cliente.create({
      data: {
        nombre: 'Carlos Rodríguez',
        cedula: '11223344',
        telefono: '099111222',
        direccion: 'Av. 18 de Julio 2345',
        email: 'carlos.rodriguez@email.com',
        activo: true,
      }
    });

    await prisma.usuario.create({
      data: {
        email: 'carlos.rodriguez@email.com',
        password: await bcrypt.hash('11223344', 10),
        rol: 'cliente',
        clienteId: cliente3.id
      }
    });

    const cliente4 = await prisma.cliente.create({
      data: {
        nombre: 'Ana Martínez',
        cedula: '55667788',
        telefono: '099555666',
        direccion: 'Colonia 3456',
        email: 'ana.martinez@email.com',
        activo: true,
      }
    });

    await prisma.usuario.create({
      data: {
        email: 'ana.martinez@email.com',
        password: await bcrypt.hash('55667788', 10),
        rol: 'cliente',
        clienteId: cliente4.id
      }
    });

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
        activo: true
      }
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
        activo: true
      }
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
        activo: true
      }
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
        activo: true
      }
    });

    await prisma.auto.create({
      data: {
        marca: 'Volkswagen',
        modelo: 'Golf',
        anio: 2022,
        matricula: 'MNO7890',
        precio: 28000,
        estado: 'disponible',
        activo: true
      }
    });

    await prisma.auto.create({
      data: {
        marca: 'Nissan',
        modelo: 'Sentra',
        anio: 2020,
        matricula: 'PQR1234',
        precio: 21000,
        estado: 'disponible',
        activo: true
      }
    });

    // Crear pagos
    const hoy = new Date();
    const diaMes = 15;

    // Pagos para auto1 (Juan Pérez)
    await prisma.pago.createMany({
      data: [
        {
          autoId: auto1.id,
          numeroCuota: 1,
          monto: 2500,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes),
          fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes + 3),
          estado: 'pagado'
        },
        {
          autoId: auto1.id,
          numeroCuota: 2,
          monto: 2500,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaMes),
          estado: 'pendiente'
        },
        {
          autoId: auto1.id,
          numeroCuota: 3,
          monto: 2500,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), diaMes),
          estado: 'pendiente'
        },
        {
          autoId: auto1.id,
          numeroCuota: 4,
          monto: 2500,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 1, diaMes),
          estado: 'pendiente'
        },
        {
          autoId: auto1.id,
          numeroCuota: 5,
          monto: 2500,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 2, diaMes),
          estado: 'pendiente'
        }
      ]
    });

    // Pagos para auto2 (María González)
    await prisma.pago.createMany({
      data: [
        {
          autoId: auto2.id,
          numeroCuota: 1,
          monto: 2200,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 3, diaMes),
          fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 3, diaMes + 2),
          estado: 'pagado'
        },
        {
          autoId: auto2.id,
          numeroCuota: 2,
          monto: 2200,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes),
          estado: 'pendiente'
        },
        {
          autoId: auto2.id,
          numeroCuota: 3,
          monto: 2200,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaMes),
          estado: 'pendiente'
        },
        {
          autoId: auto2.id,
          numeroCuota: 4,
          monto: 2200,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), diaMes),
          estado: 'pendiente'
        },
        {
          autoId: auto2.id,
          numeroCuota: 5,
          monto: 2200,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 1, diaMes),
          estado: 'pendiente'
        }
      ]
    });

    // Pagos para auto3 (Carlos Rodríguez) - Todas pagadas
    await prisma.pago.createMany({
      data: [
        {
          autoId: auto3.id,
          numeroCuota: 1,
          monto: 2000,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 4, diaMes),
          fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 4, diaMes - 1),
          estado: 'pagado'
        },
        {
          autoId: auto3.id,
          numeroCuota: 2,
          monto: 2000,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 3, diaMes),
          fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 3, diaMes - 1),
          estado: 'pagado'
        },
        {
          autoId: auto3.id,
          numeroCuota: 3,
          monto: 2000,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes),
          fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes - 1),
          estado: 'pagado'
        },
        {
          autoId: auto3.id,
          numeroCuota: 4,
          monto: 2000,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaMes),
          fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaMes - 1),
          estado: 'pagado'
        },
        {
          autoId: auto3.id,
          numeroCuota: 5,
          monto: 2000,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), diaMes),
          fechaPago: new Date(hoy.getFullYear(), hoy.getMonth(), diaMes - 1),
          estado: 'pagado'
        }
      ]
    });

    // Pagos para auto4 (Ana Martínez)
    await prisma.pago.createMany({
      data: [
        {
          autoId: auto4.id,
          numeroCuota: 1,
          monto: 1800,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes),
          fechaPago: new Date(hoy.getFullYear(), hoy.getMonth() - 2, diaMes + 5),
          estado: 'pagado'
        },
        {
          autoId: auto4.id,
          numeroCuota: 2,
          monto: 1800,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() - 1, diaMes),
          estado: 'pendiente'
        },
        {
          autoId: auto4.id,
          numeroCuota: 3,
          monto: 1800,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth(), diaMes),
          estado: 'pendiente'
        },
        {
          autoId: auto4.id,
          numeroCuota: 4,
          monto: 1800,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 1, diaMes),
          estado: 'pendiente'
        },
        {
          autoId: auto4.id,
          numeroCuota: 5,
          monto: 1800,
          fechaVencimiento: new Date(hoy.getFullYear(), hoy.getMonth() + 2, diaMes),
          estado: 'pendiente'
        }
      ]
    });

    const totalUsuarios = await prisma.usuario.count();
    const totalClientes = await prisma.cliente.count();
    const totalAutos = await prisma.auto.count();
    const totalPagos = await prisma.pago.count();

    console.log('✅ Setup completado exitosamente');

    res.json({
      success: true,
      message: 'Base de datos configurada correctamente',
      data: {
        usuarios: totalUsuarios,
        clientes: totalClientes,
        autos: totalAutos,
        pagos: totalPagos
      },
      credentials: {
        admin: 'admin@demo.com / admin123',
        clientes: ['12345678', '87654321', '11223344', '55667788']
      }
    });
  } catch (error) {
    console.error('❌ Error en setup:', error);
    res.status(500).json({
      success: false,
      error: 'Error al configurar la base de datos',
      details: error.message
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      message: 'API Gestión Automotora funcionando correctamente',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Error de conexión a la base de datos',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API Gestión Automotora',
    version: '2.0.0 - Consolidated'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_ERROR'
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path
  });
});

module.exports = app;
