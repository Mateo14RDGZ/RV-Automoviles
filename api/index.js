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
      where.estado = 'pendiente';
      where.fechaVencimiento = { lt: new Date() };
    } else if (estado) {
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

    const pagosPendientes = await prisma.pago.count({ where: { estado: 'pendiente' } });
    const pagosVencidos = await prisma.pago.count({
      where: {
        estado: 'pendiente',
        fechaVencimiento: { lt: new Date() }
      }
    });

    const totalAPagar = await prisma.pago.aggregate({
      where: { estado: 'pendiente' },
      _sum: { monto: true }
    });

    const totalPagado = await prisma.pago.aggregate({
      where: { estado: 'pagado' },
      _sum: { monto: true }
    });

    res.json({
      clientes: totalClientes,
      autos: { total: totalAutos, disponibles: autosDisponibles, vendidos: autosVendidos },
      pagos: {
        pendientes: pagosPendientes,
        vencidos: pagosVencidos,
        totalAPagar: totalAPagar._sum.monto || 0,
        totalPagado: totalPagado._sum.monto || 0
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// ==================== RUTAS DE UTILIDAD ====================

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
