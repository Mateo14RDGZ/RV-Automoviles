const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();

// Logs de inicio
console.log('🚀 Iniciando API RV Automóviles...');
console.log('📝 Variables de entorno:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   FRONTEND_URL:', process.env.FRONTEND_URL || 'No configurado');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurado' : '❌ No configurado');
console.log('   POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL ? '✅ Configurado' : '❌ No configurado');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ No configurado');

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

// Middleware para verificar que sea admin (solo admin)
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
};

// Middleware para verificar que sea staff (admin o empleado)
const requireStaff = (req, res, next) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'empleado') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de staff.' });
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
    console.log('🔐 Intentando login con email:', req.body.email);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación:', errors.array());
      return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
    }

    const { email, password } = req.body;

    // Verificar que JWT_SECRET está configurado
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no está configurado');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    console.log('🔍 Buscando usuario en base de datos...');
    const user = await prisma.usuario.findFirst({ where: { email } });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('✅ Usuario encontrado:', user.email, '- Rol:', user.rol);
    console.log('🔑 Verificando contraseña...');
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('✅ Contraseña correcta, generando token...');
    
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Token generado exitosamente');
    
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('❌ Error en login:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      details: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// Login cliente - requiere cédula y contraseña
app.post('/api/auth/login-cliente', [
  body('cedula').trim().isLength({ min: 8, max: 8 }).isNumeric().withMessage('La cédula debe tener 8 dígitos'),
  body('password').notEmpty().withMessage('Se requiere contraseña')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Errores de validación:', errors.array());
      return res.status(400).json({ error: 'Datos inválidos', details: errors.array() });
    }

    const { cedula, password } = req.body;
    console.log('🔐 Intentando login de cliente con cédula:', cedula);

    // Buscar cliente por cédula
    const cliente = await prisma.cliente.findFirst({
      where: { cedula },
      include: { 
        usuario: true,
        autos: {
          where: {
            estado: 'financiado'
          }
        },
        permutas: true
      }
    });

    console.log('👤 Cliente encontrado:', cliente ? `${cliente.nombre} (ID: ${cliente.id})` : 'No encontrado');
    
    if (!cliente) {
      console.log('❌ Cliente no existe con esa cédula');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('🔍 Cliente tiene usuario:', cliente.usuario ? 'SÍ' : 'NO');
    console.log('🚗 Autos financiados:', cliente.autos?.length || 0);

    // Verificar que tenga usuario
    if (!cliente.usuario) {
      console.log('❌ Cliente no tiene usuario asociado');
      return res.status(401).json({ error: 'Error de configuración. Contacta con la automotora.' });
    }

    // Verificar que tenga al menos un auto financiado (plan de cuotas activo)
    if (!cliente.autos || cliente.autos.length === 0) {
      console.log('❌ Cliente no tiene autos financiados');
      return res.status(401).json({ error: 'No tienes un plan de cuotas activo. Contacta con la automotora.' });
    }

    // Verificar contraseña
    console.log('🔑 Verificando contraseña...');
    const isValidPassword = await bcrypt.compare(password, cliente.usuario.password);
    console.log('🔑 Contraseña válida:', isValidPassword ? 'SÍ' : 'NO');
    
    if (!isValidPassword) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log(`Cliente ${cliente.nombre} tiene ${cliente.autos.length} auto(s) financiado(s)`);

    // Generar token JWT
    const token = jwt.sign(
      {
        id: cliente.usuario.id,
        clienteId: cliente.id,
        nombre: cliente.nombre,
        cedula: cliente.cedula,
        rol: 'cliente'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: cliente.usuario.id,
        nombre: cliente.nombre,
        cedula: cliente.cedula,
        email: cliente.email,
        rol: 'cliente',
        clienteId: cliente.id
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
      return res.status(404).json({ valid: false, error: 'Usuario no encontrado' });
    }

    const { password: _, ...userWithoutPassword } = user;
    
    // Preparar el objeto user con el formato correcto
    const userData = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      clienteId: user.clienteId,
      nombre: user.cliente ? user.cliente.nombre : null
    };
    
    res.json({ valid: true, user: userData });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ valid: false, error: 'Error al verificar token' });
  }
});

// ==================== ENDPOINT DE DIAGNÓSTICO ====================

app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`;
    
    // Contar registros
    const [autosCount, clientesCount, pagosCount] = await Promise.all([
      prisma.auto.count(),
      prisma.cliente.count(),
      prisma.pago.count()
    ]);
    
    res.json({
      status: 'OK',
      database: {
        connected: true,
        url: process.env.DATABASE_URL ? 'Configurada' : 'NO CONFIGURADA',
        counts: {
          autos: autosCount,
          clientes: clientesCount,
          pagos: pagosCount
        }
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en health check:', error);
    res.status(500).json({
      status: 'ERROR',
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

// ==================== RUTAS DE AUTOS ====================

app.get('/api/autos', authenticateToken, async (req, res) => {
  try {
    const { estado, clienteId } = req.query;
    const where = { activo: true }; // Solo mostrar autos activos en el stock

    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = parseInt(clienteId);

    console.log('🚗 Consultando autos. Usuario:', req.user.email, 'Filtros:', where);

    const autos = await prisma.auto.findMany({
      where,
      include: {
        cliente: true,
        pagos: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Autos encontrados: ${autos.length}`, autos.map(a => `${a.marca} ${a.modelo} (ID: ${a.id})`).join(', '));

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

app.post('/api/autos', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { 
      marca, 
      modelo, 
      anio, 
      matricula, 
      precio, 
      estado, 
      clienteId,
      // Nuevos campos
      kilometraje,
      color,
      departamento,
      tipoDocumento,
      valorPatente,
      escribana
    } = req.body;

    console.log('🚗 Creando auto:', { 
      marca, modelo, anio, matricula, precio, estado, clienteId,
      kilometraje, color, departamento, tipoDocumento, valorPatente, escribana
    });
    console.log('📊 DATABASE_URL configurada:', process.env.DATABASE_URL ? 'SÍ' : 'NO');

    // Si no hay matrícula o está vacía, usar "0km"
    const matriculaFinal = !matricula || matricula.trim() === '' ? '0km' : matricula.trim();
    
    console.log('🔄 Matrícula procesada:', { original: matricula, final: matriculaFinal });

    // Validar que la matrícula no esté duplicada (excepto "0km")
    if (matriculaFinal !== '0km') {
      console.log('🔍 Verificando si matrícula ya existe:', matriculaFinal);
      const autoExistente = await prisma.auto.findFirst({
        where: { matricula: matriculaFinal }
      });
      
      if (autoExistente) {
        console.log('❌ Matrícula duplicada encontrada:', autoExistente.id);
        return res.status(400).json({ error: 'Ya existe un auto con esta matrícula' });
      }
      console.log('✅ Matrícula disponible');
    } else {
      console.log('✅ Auto 0km - permitiendo múltiples');
    }

    // Intentar crear el auto con todos los campos
    let auto;
    try {
      auto = await prisma.auto.create({
        data: {
          marca,
          modelo,
          anio: parseInt(anio),
          matricula: matriculaFinal,
          precio: parseFloat(precio),
          estado: estado || 'disponible',
          clienteId: clienteId ? parseInt(clienteId) : null,
          // Nuevos campos adicionales
          kilometraje: kilometraje ? parseInt(kilometraje) : null,
          color: color || null,
          departamento: departamento || null,
          tipoDocumento: tipoDocumento || null,
          valorPatente: valorPatente ? parseFloat(valorPatente) : null,
          escribana: escribana || null
        },
        include: { cliente: true }
      });
    } catch (createError) {
      // Si falla por el campo escribana (columna no existe), intentar sin ese campo
      if (createError.message && createError.message.includes('escribana')) {
        console.log('⚠️ Campo escribana no disponible, creando auto sin ese campo');
        auto = await prisma.auto.create({
          data: {
            marca,
            modelo,
            anio: parseInt(anio),
            matricula: matriculaFinal,
            precio: parseFloat(precio),
            estado: estado || 'disponible',
            clienteId: clienteId ? parseInt(clienteId) : null,
            // Nuevos campos adicionales
            kilometraje: kilometraje ? parseInt(kilometraje) : null,
            color: color || null,
            departamento: departamento || null,
            tipoDocumento: tipoDocumento || null,
            valorPatente: valorPatente ? parseFloat(valorPatente) : null
            // escribana omitido si la columna no existe
          },
          include: { cliente: true }
        });
      } else {
        // Si es otro error, relanzarlo
        throw createError;
      }
    }

    console.log('✅ Auto creado exitosamente en DB:', { 
      id: auto.id, 
      marca: auto.marca, 
      modelo: auto.modelo,
      kilometraje: auto.kilometraje,
      color: auto.color
    });
    
    // Verificar que el auto realmente se guardó
    const autoVerificado = await prisma.auto.findUnique({
      where: { id: auto.id }
    });
    
    console.log('🔍 Verificación de auto en DB:', autoVerificado ? 'EXISTE' : 'NO EXISTE');
    
    res.status(201).json(auto);
  } catch (error) {
    console.error('❌ Error creando auto:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error meta:', error.meta);
    
    // Manejo específico de error de matrícula única (constraint violation)
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      console.error('❌ Constraint violation en:', target);
      
      if (target && target.includes('matricula')) {
        return res.status(400).json({ 
          error: 'Error de base de datos: El índice único de matrícula aún existe',
          details: 'La migración no se aplicó correctamente. Por favor contacte al administrador.',
          suggestion: 'Intente nuevamente en unos minutos o use una matrícula diferente'
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Error al crear auto', 
      details: error.message,
      code: error.code 
    });
  }
});

app.put('/api/autos/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { 
      marca, 
      modelo, 
      anio, 
      matricula, 
      precio, 
      estado, 
      clienteId,
      // Nuevos campos
      kilometraje,
      color,
      departamento,
      tipoDocumento,
      valorPatente,
      escribana
    } = req.body;

    // Si no hay matrícula o está vacía, usar "0km"
    const matriculaFinal = !matricula || matricula.trim() === '' ? '0km' : matricula.trim();

    // Validar que la matrícula no esté duplicada (excepto "0km")
    if (matriculaFinal !== '0km') {
      const autoExistente = await prisma.auto.findFirst({
        where: { 
          matricula: matriculaFinal,
          NOT: { id: parseInt(req.params.id) }
        }
      });
      
      if (autoExistente) {
        return res.status(400).json({ error: 'Ya existe un auto con esta matrícula' });
      }
    }

    // Intentar actualizar el auto con todos los campos
    let auto;
    try {
      auto = await prisma.auto.update({
        where: { id: parseInt(req.params.id) },
        data: {
          marca,
          modelo,
          anio: parseInt(anio),
          matricula: matriculaFinal,
          precio: parseFloat(precio),
          estado,
          clienteId: clienteId ? parseInt(clienteId) : null,
          // Nuevos campos adicionales
          kilometraje: kilometraje ? parseInt(kilometraje) : null,
          color: color || null,
          departamento: departamento || null,
          tipoDocumento: tipoDocumento || null,
          valorPatente: valorPatente ? parseFloat(valorPatente) : null,
          escribana: escribana || null
        },
        include: { cliente: true }
      });
    } catch (updateError) {
      // Si falla por el campo escribana (columna no existe), intentar sin ese campo
      if (updateError.message && updateError.message.includes('escribana')) {
        console.log('⚠️ Campo escribana no disponible, actualizando auto sin ese campo');
        auto = await prisma.auto.update({
          where: { id: parseInt(req.params.id) },
          data: {
            marca,
            modelo,
            anio: parseInt(anio),
            matricula: matriculaFinal,
            precio: parseFloat(precio),
            estado,
            clienteId: clienteId ? parseInt(clienteId) : null,
            // Nuevos campos adicionales
            kilometraje: kilometraje ? parseInt(kilometraje) : null,
            color: color || null,
            departamento: departamento || null,
            tipoDocumento: tipoDocumento || null,
            valorPatente: valorPatente ? parseFloat(valorPatente) : null
            // escribana omitido si la columna no existe
          },
          include: { cliente: true }
        });
      } else {
        // Si es otro error, relanzarlo
        throw updateError;
      }
    }

    res.json(auto);
  } catch (error) {
    console.error('Error actualizando auto:', error);
    
    // Manejo específico de error de matrícula única
    if (error.code === 'P2002' && error.meta?.target?.includes('matricula')) {
      return res.status(400).json({ 
        error: 'Ya existe un auto con esta matrícula',
        details: 'La matrícula debe ser única. Si el auto es 0km, deje el campo vacío.'
      });
    }
    
    res.status(500).json({ 
      error: 'Error al actualizar auto',
      details: error.message,
      code: error.code
    });
  }
});

app.delete('/api/autos/:id', authenticateToken, requireStaff, async (req, res) => {
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

    console.log('👥 Consultando clientes. Usuario:', req.user.email, 'Filtros:', where);

    const clientes = await prisma.cliente.findMany({
      where,
      include: {
        autos: true,
        usuario: { select: { id: true, email: true, rol: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Clientes encontrados: ${clientes.length}`, clientes.map(c => `${c.nombre} (ID: ${c.id})`).join(', '));

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

app.post('/api/clientes', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { nombre, cedula, telefono, direccion, email } = req.body;

    console.log('👤 Creando cliente:', { nombre, cedula, telefono, email });
    console.log('📊 DATABASE_URL configurada:', process.env.DATABASE_URL ? 'SÍ' : 'NO');

    // Generar contraseña aleatoria de 8 caracteres (letras y números)
    const generatePassword = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      let password = '';
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const passwordTemporal = generatePassword();
    const hashedPassword = await bcrypt.hash(passwordTemporal, 10);

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

    console.log('✅ Cliente creado exitosamente en DB:', { id: cliente.id, nombre: cliente.nombre });
    console.log('🔑 Contraseña generada:', passwordTemporal);
    
    // Verificar que el cliente realmente se guardó
    const clienteVerificado = await prisma.cliente.findUnique({
      where: { id: cliente.id }
    });
    
    console.log('🔍 Verificación de cliente en DB:', clienteVerificado ? 'EXISTE' : 'NO EXISTE');

    // Devolver el cliente con la contraseña temporal para que el frontend pueda enviarla por WhatsApp
    res.status(201).json({
      ...cliente,
      passwordTemporal, // Solo se envía una vez al crear el cliente
      emailUsuario: email || `${cedula}@cliente.com`
    });
  } catch (error) {
    console.error('❌ Error creando cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente', details: error.message });
  }
});

app.put('/api/clientes/:id', authenticateToken, requireStaff, async (req, res) => {
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

app.delete('/api/clientes/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const clienteId = parseInt(req.params.id);
    
    // 1. Obtener el cliente con todos sus autos
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        autos: true,
        permutas: true,
        usuario: true
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    console.log(`🗑️ Eliminando cliente ${cliente.nombre} (ID: ${clienteId})...`);

    // 2. Para cada auto del cliente, eliminar todos los pagos y sus comprobantes
    for (const auto of cliente.autos) {
      console.log(`  📋 Eliminando pagos del auto ${auto.marca} ${auto.modelo} (ID: ${auto.id})...`);
      
      // Obtener todos los pagos del auto
      const pagos = await prisma.pago.findMany({
        where: { autoId: auto.id },
        include: { comprobantes: true }
      });

      // Eliminar todos los comprobantes de pago
      for (const pago of pagos) {
        if (pago.comprobantes && pago.comprobantes.length > 0) {
          await prisma.comprobantePago.deleteMany({
            where: { pagoId: pago.id }
          });
          console.log(`    ✅ Eliminados ${pago.comprobantes.length} comprobantes del pago ${pago.id}`);
        }
      }

      // Eliminar todos los pagos del auto
      const pagosEliminados = await prisma.pago.deleteMany({
        where: { autoId: auto.id }
      });
      console.log(`    ✅ Eliminados ${pagosEliminados.count} pagos del auto ${auto.id}`);

      // 3. Limpiar la relación del auto (poner clienteId a null) para que pueda eliminarse después
      await prisma.auto.update({
        where: { id: auto.id },
        data: { clienteId: null, estado: 'disponible' }
      });
      console.log(`    ✅ Auto ${auto.id} desvinculado del cliente y marcado como disponible`);
    }

    // 4. Eliminar todas las permutas del cliente
    if (cliente.permutas && cliente.permutas.length > 0) {
      const permutasEliminadas = await prisma.permuta.deleteMany({
        where: { clienteId: clienteId }
      });
      console.log(`  ✅ Eliminadas ${permutasEliminadas.count} permutas del cliente`);
    }

    // 5. Eliminar el usuario asociado si existe
    if (cliente.usuario) {
      await prisma.usuario.delete({
        where: { id: cliente.usuario.id }
      });
      console.log(`  ✅ Usuario ${cliente.usuario.email} eliminado`);
    }

    // 6. Finalmente, eliminar el cliente
    await prisma.cliente.delete({
      where: { id: clienteId }
    });

    console.log(`✅ Cliente ${cliente.nombre} eliminado correctamente`);
    res.json({ message: 'Cliente eliminado correctamente. Todos los pagos y relaciones han sido limpiados.' });
  } catch (error) {
    console.error('❌ Error eliminando cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente', details: error.message });
  }
});

// ==================== RUTAS DE PAGOS ====================

app.get('/api/pagos', authenticateToken, async (req, res) => {
  try {
    const { estado, vencidos, autoId } = req.query;
    const where = {};

    console.log('📥 GET /api/pagos - Query params:', { estado, vencidos, autoId, rol: req.user.rol, clienteId: req.user.clienteId });

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

    console.log('🔍 Prisma where:', JSON.stringify(where, null, 2));

    const pagos = await prisma.pago.findMany({
      where,
      include: {
        auto: { 
          include: { 
            cliente: true,
            permutas: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          } 
        }
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { numeroCuota: 'asc' }
      ]
    });

    console.log('✅ Pagos encontrados:', pagos.length, '- Estados:', pagos.map(p => p.estado).join(', '));
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
      include: { 
        auto: { 
          include: { 
            cliente: true,
            permutas: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          } 
        } 
      }
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

app.post('/api/pagos/generar-cuotas', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { autoId, numeroCuotas, montoPorCuota, fechaPrimeraCuota, permuta, cuotasPagadas = 0 } = req.body;

    console.log('💳 Generando plan de cuotas:', { autoId, numeroCuotas, montoPorCuota, fechaPrimeraCuota, cuotasPagadas });

    const auto = await prisma.auto.findUnique({ 
      where: { id: parseInt(autoId) },
      include: { cliente: true }
    });
    
    if (!auto) {
      console.error('❌ Auto no encontrado. ID recibido:', autoId, 'Tipo:', typeof autoId);
      return res.status(404).json({ error: 'Auto no encontrado', autoId: autoId });
    }

    if (!auto.clienteId) {
      return res.status(400).json({ error: 'El auto debe tener un cliente asignado' });
    }

    console.log('✅ Auto encontrado:', { id: auto.id, marca: auto.marca, modelo: auto.modelo, cliente: auto.cliente?.nombre });

    // Guardar permuta si existe
    let permutaCreada = null;
    if (permuta && permuta.tienePermuta && permuta.tipoPermuta) {
      console.log('🔄 Guardando permuta...');
      
      const permutaData = {
        tipo: permuta.tipoPermuta,
        valorEstimado: 0,
        clienteId: auto.clienteId,
        autoVendidoId: parseInt(autoId)
      };

      // Agregar datos según el tipo
      if (permuta.tipoPermuta === 'auto' && permuta.permutaAuto) {
        permutaData.autoMarca = permuta.permutaAuto.marca || null;
        permutaData.autoModelo = permuta.permutaAuto.modelo || null;
        permutaData.autoAnio = permuta.permutaAuto.anio ? parseInt(permuta.permutaAuto.anio) : null;
        permutaData.autoMatricula = permuta.permutaAuto.matricula || null;
        permutaData.valorEstimado = permuta.permutaAuto.precio ? parseFloat(permuta.permutaAuto.precio) : 0;
        permutaData.descripcion = `${permuta.permutaAuto.marca} ${permuta.permutaAuto.modelo} ${permuta.permutaAuto.anio}`;
      } else if (permuta.tipoPermuta === 'moto' && permuta.permutaMoto) {
        permutaData.motoMarca = permuta.permutaMoto.marca || null;
        permutaData.motoModelo = permuta.permutaMoto.modelo || null;
        permutaData.motoAnio = permuta.permutaMoto.anio ? parseInt(permuta.permutaMoto.anio) : null;
        permutaData.valorEstimado = permuta.permutaMoto.precio ? parseFloat(permuta.permutaMoto.precio) : 0;
        permutaData.descripcion = `${permuta.permutaMoto.marca} ${permuta.permutaMoto.modelo} ${permuta.permutaMoto.anio}`;
      } else if (permuta.tipoPermuta === 'otros' && permuta.permutaOtros) {
        permutaData.descripcion = permuta.permutaOtros.descripcion || '';
        permutaData.valorEstimado = permuta.permutaOtros.precio ? parseFloat(permuta.permutaOtros.precio) : 0;
      }

      try {
        permutaCreada = await prisma.permuta.create({
          data: permutaData
        });
        console.log('✅ Permuta guardada:', permutaCreada.id);
      } catch (permutaError) {
        console.error('⚠️ Error al guardar permuta:', permutaError);
        // Continuamos con el proceso aunque falle la permuta
      }
    }

    const pagos = [];
    const cuotasPagadasNum = parseInt(cuotasPagadas) || 0;
    
    for (let i = 1; i <= numeroCuotas; i++) {
      const fechaVencimiento = new Date(fechaPrimeraCuota);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + (i - 1));

      // Si esta cuota está dentro de las cuotas ya pagadas
      const esCuotaPagada = i <= cuotasPagadasNum;
      
      const pagoData = {
        autoId: parseInt(autoId),
        numeroCuota: i,
        monto: parseFloat(montoPorCuota),
        fechaVencimiento,
        estado: esCuotaPagada ? 'pagado' : 'pendiente'
      };

      // Si es una cuota pagada, agregar fecha de pago
      if (esCuotaPagada) {
        // Usar la fecha de vencimiento como fecha de pago para cuotas históricas
        pagoData.fechaPago = fechaVencimiento;
      }

      pagos.push(pagoData);
    }

    console.log(`📝 Creando ${pagos.length} cuotas (${cuotasPagadasNum} ya pagadas)...`);

    const createdPagos = await Promise.all(
      pagos.map(pago => prisma.pago.create({ data: pago }))
    );

    console.log('✅ Cuotas creadas exitosamente:', createdPagos.length);

    // Marcar auto como financiado (plan de cuotas en progreso)
    await prisma.auto.update({
      where: { id: parseInt(autoId) },
      data: { estado: 'financiado' }
    });

    console.log('✅ Auto marcado como financiado (plan en progreso)');

    const response = {
      pagos: createdPagos,
      permuta: permutaCreada ? {
        id: permutaCreada.id,
        tipo: permutaCreada.tipo,
        valorEstimado: permutaCreada.valorEstimado,
        guardada: true
      } : null
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Error generando cuotas:', error);
    res.status(500).json({ error: 'Error al generar cuotas', details: error.message });
  }
});

app.put('/api/pagos/:id/registrar-pago', authenticateToken, requireStaff, async (req, res) => {
  try {
    const pago = await prisma.pago.update({
      where: { id: parseInt(req.params.id) },
      data: {
        estado: 'pagado',
        fechaPago: new Date()
      },
      include: { auto: { include: { cliente: true } } }
    });

    // Verificar si todas las cuotas del auto están pagadas
    const todosPagos = await prisma.pago.findMany({
      where: { autoId: pago.autoId }
    });

    const todosCompletados = todosPagos.every(p => p.estado === 'pagado');

    if (todosCompletados) {
      console.log('🎉 Todas las cuotas pagadas! Finalizando venta:', pago.autoId);
      
      // Obtener el auto con su cliente
      const auto = await prisma.auto.findUnique({
        where: { id: pago.autoId },
        include: { cliente: true }
      });

      if (auto) {
        // 1. Marcar auto como vendido (NO eliminarlo)
        await prisma.auto.update({
          where: { id: pago.autoId },
          data: { estado: 'vendido', activo: false }
        });
        console.log('✅ Auto marcado como vendido');

        // 2. Eliminar cliente y su usuario asociado
        if (auto.clienteId) {
          // Eliminar usuario del cliente si existe
          const usuario = await prisma.usuario.findFirst({
            where: { clienteId: auto.clienteId }
          });
          
          if (usuario) {
            await prisma.usuario.delete({
              where: { id: usuario.id }
            });
            console.log('✅ Usuario del cliente eliminado');
          }

          // Eliminar cliente
          await prisma.cliente.delete({
            where: { id: auto.clienteId }
          });
          console.log('✅ Cliente eliminado automáticamente');
        }
      }
    }

    res.json(pago);
  } catch (error) {
    console.error('Error registrando pago:', error);
    res.status(500).json({ error: 'Error al registrar pago' });
  }
});

// Actualizar pago (genérico)
app.put('/api/pagos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('📝 Actualizando pago:', { id, updateData });

    // Si se está marcando como pagado y no tiene fechaPago, agregarla
    if (updateData.estado === 'pagado' && !updateData.fechaPago) {
      updateData.fechaPago = new Date();
    }

    // Convertir fechaPago a Date si viene como string
    if (updateData.fechaPago && typeof updateData.fechaPago === 'string') {
      updateData.fechaPago = new Date(updateData.fechaPago);
    }

    const pago = await prisma.pago.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { auto: { include: { cliente: true } } }
    });

    console.log('✅ Pago actualizado:', pago);

    // Si se marcó como pagado, verificar si todas las cuotas están pagadas
    if (updateData.estado === 'pagado' && pago.autoId) {
      const todosPagos = await prisma.pago.findMany({
        where: { autoId: pago.autoId }
      });

      const todosCompletados = todosPagos.every(p => p.estado === 'pagado');

      if (todosCompletados) {
        console.log('🎉 Todas las cuotas pagadas! Finalizando venta:', pago.autoId);
        
        // Obtener el auto con su cliente antes de cualquier cambio
        const auto = await prisma.auto.findUnique({
          where: { id: pago.autoId },
          include: { cliente: true }
        });

        if (auto) {
          // 1. Marcar auto como vendido (NO eliminarlo)
          await prisma.auto.update({
            where: { id: pago.autoId },
            data: { estado: 'vendido', activo: false }
          });
          console.log('✅ Auto marcado como vendido');

          // 2. Eliminar cliente y su usuario asociado
          if (auto.clienteId) {
            // Eliminar usuario del cliente si existe
            const usuario = await prisma.usuario.findFirst({
              where: { clienteId: auto.clienteId }
            });
            
            if (usuario) {
              await prisma.usuario.delete({
                where: { id: usuario.id }
              });
              console.log('✅ Usuario del cliente eliminado');
            }

            // Eliminar cliente
            await prisma.cliente.delete({
              where: { id: auto.clienteId }
            });
            console.log('✅ Cliente eliminado automáticamente');
          }
        }
      }
    }

    res.json(pago);
  } catch (error) {
    console.error('❌ Error actualizando pago:', error);
    res.status(500).json({ error: 'Error al actualizar pago', details: error.message });
  }
});

app.delete('/api/pagos/:id', authenticateToken, requireStaff, async (req, res) => {
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

// ==================== RUTAS DE COMPROBANTES DE PAGO ====================

const { isCliente } = require('./lib/auth');
// Subir comprobante de pago (solo cliente)
app.post('/api/comprobantes', authenticateToken, isCliente, async (req, res) => {
  try {
    const { pagoId, archivoBase64, tipoArchivo } = req.body;

    if (!pagoId || !archivoBase64) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Validar tipo de archivo - aceptar múltiples variantes de PDF
    const tiposPermitidos = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'application/pdf',
      'application/x-pdf',
      'application/acrobat',
      'applications/vnd.pdf',
      'text/pdf',
      'text/x-pdf'
    ];
    
    // Si no hay tipoArchivo, intentar detectarlo del base64
    let tipoArchivoFinal = tipoArchivo;
    if (!tipoArchivoFinal && archivoBase64.startsWith('data:')) {
      const match = archivoBase64.match(/data:([^;]+)/);
      if (match) {
        tipoArchivoFinal = match[1];
      }
    }
    
    if (tipoArchivoFinal && !tiposPermitidos.includes(tipoArchivoFinal)) {
      // Validar por extensión si el tipo MIME no es reconocido
      const esValido = archivoBase64.includes('pdf') || 
                       archivoBase64.includes('jpeg') || 
                       archivoBase64.includes('jpg') || 
                       archivoBase64.includes('png');
      
      if (!esValido) {
        return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo se permiten PDF, JPG y PNG' });
      }
    }

    // Verificar que el pago existe y pertenece al cliente
    const pago = await prisma.pago.findUnique({
      where: { id: parseInt(pagoId) },
      include: { auto: { include: { cliente: true } } }
    });

    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Si el usuario es cliente, verificar que el pago le pertenece
    if (req.user.rol === 'cliente') {
      // El token del cliente contiene clienteId directamente
      const clienteId = req.user.clienteId || req.user.id;
      
      // Verificar que el pago pertenece al cliente autenticado
      if (!pago.auto.clienteId || pago.auto.clienteId !== clienteId) {
        return res.status(403).json({ error: 'No tienes permiso para subir comprobante de este pago' });
      }
    }

    // Crear el comprobante (número de cuenta será configurado por el administrador en el futuro)
    const comprobante = await prisma.comprobantePago.create({
      data: {
        pagoId: parseInt(pagoId),
        numeroCuenta: '', // Se configurará en el futuro con el número de cuenta de la automotora
        archivoUrl: archivoBase64, // Almacenamos base64 directamente
        estado: 'pendiente',
        visto: false
      },
      include: {
        pago: {
          include: {
            auto: {
              include: {
                cliente: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(comprobante);
  } catch (error) {
    console.error('Error al subir comprobante:', error);
    res.status(500).json({ error: 'Error al subir comprobante', details: error.message });
  }
});

// Obtener notificaciones de comprobantes (admin y empleado)
app.get('/api/comprobantes/notificaciones', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { estado, visto } = req.query;

    const where = {};
    if (estado) {
      where.estado = estado;
    }
    if (visto !== undefined) {
      where.visto = visto === 'true';
    }

    const comprobantes = await prisma.comprobantePago.findMany({
      where,
      include: {
        pago: {
          include: {
            auto: {
              include: {
                cliente: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(comprobantes);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones', details: error.message });
  }
});

// Marcar comprobante como visto
app.put('/api/comprobantes/:id/visto', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { visto } = req.body;

    const comprobante = await prisma.comprobantePago.update({
      where: { id: parseInt(id) },
      data: { visto: visto !== undefined ? visto : true },
      include: {
        pago: {
          include: {
            auto: {
              include: {
                cliente: true
              }
            }
          }
        }
      }
    });

    res.json(comprobante);
  } catch (error) {
    console.error('Error al actualizar comprobante:', error);
    res.status(500).json({ error: 'Error al actualizar comprobante', details: error.message });
  }
});

// Actualizar estado del comprobante (aprobar/rechazar)
app.put('/api/comprobantes/:id/estado', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas } = req.body;

    if (!estado || !['pendiente', 'aprobado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const comprobante = await prisma.comprobantePago.findUnique({
      where: { id: parseInt(id) },
      include: { pago: true }
    });

    if (!comprobante) {
      return res.status(404).json({ error: 'Comprobante no encontrado' });
    }

    // Si se aprueba, actualizar el pago como pagado
    if (estado === 'aprobado' && comprobante.pago.estado === 'pendiente') {
      await prisma.pago.update({
        where: { id: comprobante.pagoId },
        data: {
          estado: 'pagado',
          fechaPago: new Date()
        }
      });

      // Verificar si todas las cuotas del auto están pagadas
      const todosPagos = await prisma.pago.findMany({
        where: { autoId: comprobante.pago.autoId }
      });

      const todosCompletados = todosPagos.every(p => p.estado === 'pagado');

      if (todosCompletados) {
        console.log('🎉 Todas las cuotas pagadas! Archivando auto:', comprobante.pago.autoId);
        
        // Obtener el auto con su cliente
        const auto = await prisma.auto.findUnique({
          where: { id: comprobante.pago.autoId },
          include: { cliente: true }
        });

        if (auto) {
          // 1. Marcar auto como vendido y archivado
          await prisma.auto.update({
            where: { id: comprobante.pago.autoId },
            data: { estado: 'vendido', activo: false }
          });
          console.log('✅ Auto archivado - ya no aparecerá en el stock');

          // 2. Eliminar cliente y su usuario asociado
          if (auto.clienteId) {
            // Eliminar usuario del cliente si existe
            const usuario = await prisma.usuario.findFirst({
              where: { clienteId: auto.clienteId }
            });
            
            if (usuario) {
              await prisma.usuario.delete({
                where: { id: usuario.id }
              });
              console.log('✅ Usuario del cliente eliminado');
            }

            // Eliminar cliente
            await prisma.cliente.delete({
              where: { id: auto.clienteId }
            });
            console.log('✅ Cliente eliminado automáticamente');
          }
        }
      }
    }

    const comprobanteActualizado = await prisma.comprobantePago.update({
      where: { id: parseInt(id) },
      data: {
        estado,
        visto: true,
        notas: notas || null
      },
      include: {
        pago: {
          include: {
            auto: {
              include: {
                cliente: true
              }
            }
          }
        }
      }
    });

    res.json(comprobanteActualizado);
  } catch (error) {
    console.error('Error al actualizar estado del comprobante:', error);
    res.status(500).json({ error: 'Error al actualizar estado del comprobante', details: error.message });
  }
});

// Obtener comprobantes de un pago específico
app.get('/api/comprobantes/pago/:pagoId', authenticateToken, async (req, res) => {
  try {
    const { pagoId } = req.params;

    const comprobantes = await prisma.comprobantePago.findMany({
      where: { pagoId: parseInt(pagoId) },
      include: {
        pago: {
          include: {
            auto: {
              include: {
                cliente: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(comprobantes);
  } catch (error) {
    console.error('Error al obtener comprobantes:', error);
    res.status(500).json({ error: 'Error al obtener comprobantes', details: error.message });
  }
});

// ==================== RUTAS DE PERMUTAS ====================

// Obtener todas las permutas
app.get('/api/permutas', authenticateToken, requireStaff, async (req, res) => {
  try {
    const permutas = await prisma.permuta.findMany({
      include: {
        cliente: true,
        autoVendido: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(permutas);
  } catch (error) {
    console.error('Error obteniendo permutas:', error);
    res.status(500).json({ error: 'Error al obtener permutas' });
  }
});

// Obtener permuta por ID
app.get('/api/permutas/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const permuta = await prisma.permuta.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        cliente: true,
        autoVendido: true
      }
    });

    if (!permuta) {
      return res.status(404).json({ error: 'Permuta no encontrada' });
    }

    res.json(permuta);
  } catch (error) {
    console.error('Error obteniendo permuta:', error);
    res.status(500).json({ error: 'Error al obtener permuta' });
  }
});

// Obtener permutas por auto
app.get('/api/permutas/auto/:autoId', authenticateToken, async (req, res) => {
  try {
    const permutas = await prisma.permuta.findMany({
      where: { autoVendidoId: parseInt(req.params.autoId) },
      include: {
        cliente: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(permutas);
  } catch (error) {
    console.error('Error obteniendo permutas del auto:', error);
    res.status(500).json({ error: 'Error al obtener permutas' });
  }
});

// Actualizar permuta
app.put('/api/permutas/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const permuta = await prisma.permuta.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        cliente: true,
        autoVendido: true
      }
    });

    res.json(permuta);
  } catch (error) {
    console.error('Error actualizando permuta:', error);
    res.status(500).json({ error: 'Error al actualizar permuta' });
  }
});

// Estadísticas de permutas
app.get('/api/permutas/stats/resumen', authenticateToken, requireStaff, async (req, res) => {
  try {
    const totalPermutas = await prisma.permuta.count();
    
    const permutasPorTipo = await prisma.permuta.groupBy({
      by: ['tipo'],
      _count: true
    });

    const valorTotalEstimado = await prisma.permuta.aggregate({
      _sum: {
        valorEstimado: true
      }
    });

    res.json({
      total: totalPermutas,
      porTipo: permutasPorTipo,
      valorTotal: valorTotalEstimado._sum.valorEstimado || 0
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de permutas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// ==================== RUTAS DE DASHBOARD ====================

// Endpoint especial para reportes - incluye TODOS los autos (activos e inactivos)
app.get('/api/autos/todos', authenticateToken, requireStaff, async (req, res) => {
  try {
    console.log('📊 Consultando TODOS los autos para reportes');

    const autos = await prisma.auto.findMany({
      // Sin filtro de activo: incluye archivados
      include: {
        cliente: true,
        pagos: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Autos encontrados (incluyendo archivados): ${autos.length}`);
    res.json(autos);
  } catch (error) {
    console.error('Error obteniendo todos los autos:', error);
    res.status(500).json({ error: 'Error al obtener autos' });
  }
});

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
          select: {
            id: true,
            marca: true,
            modelo: true,
            matricula: true,
            anio: true,
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
          select: {
            id: true,
            marca: true,
            modelo: true,
            matricula: true,
            anio: true,
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
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      details: error.message 
    });
  }
});

// Dashboard para empleados (SIN información monetaria)
app.get('/api/dashboard/stats-empleado', authenticateToken, requireStaff, async (req, res) => {
  try {
    const totalClientes = await prisma.cliente.count({ where: { activo: true } });
    const totalAutos = await prisma.auto.count();
    const autosDisponibles = await prisma.auto.count({ where: { estado: 'disponible' } });
    const autosVendidos = await prisma.auto.count({ where: { estado: 'vendido' } });
    const autosFinanciados = await prisma.auto.count({ where: { estado: 'financiado' } });

    const pagosPendientes = await prisma.pago.count({ where: { estado: 'pendiente' } });
    const pagosVencidos = await prisma.pago.count({
      where: {
        estado: 'pendiente',
        fechaVencimiento: { lt: new Date() }
      }
    });
    const pagosPagados = await prisma.pago.count({ where: { estado: 'pagado' } });

    // Próximos vencimientos (próximos 7 días) - SIN montos
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
      select: {
        id: true,
        numeroCuota: true,
        fechaVencimiento: true,
        estado: true,
        auto: {
          select: {
            id: true,
            marca: true,
            modelo: true,
            anio: true,
            matricula: true,
            cliente: {
              select: {
                id: true,
                nombre: true,
                telefono: true
              }
            }
          }
        }
      },
      orderBy: { fechaVencimiento: 'asc' },
      take: 10
    });

    // Pagos vencidos - SIN montos
    const pagosVencidosDetalle = await prisma.pago.findMany({
      where: {
        estado: 'pendiente',
        fechaVencimiento: { lt: hoy }
      },
      select: {
        id: true,
        numeroCuota: true,
        fechaVencimiento: true,
        estado: true,
        auto: {
          select: {
            id: true,
            marca: true,
            modelo: true,
            anio: true,
            matricula: true,
            cliente: {
              select: {
                id: true,
                nombre: true,
                telefono: true
              }
            }
          }
        }
      },
      orderBy: { fechaVencimiento: 'asc' },
      take: 10
    });

    // Clientes con financiamiento activo
    const clientesConFinanciamiento = await prisma.cliente.findMany({
      where: {
        activo: true,
        autos: {
          some: {
            estado: 'financiado'
          }
        }
      },
      select: {
        id: true,
        nombre: true,
        telefono: true,
        autos: {
          where: {
            estado: 'financiado'
          },
          select: {
            id: true,
            marca: true,
            modelo: true,
            anio: true,
            matricula: true
          }
        }
      },
      take: 10
    });

    // Total de permutas (sin valores)
    const totalPermutas = await prisma.permuta.count();

    res.json({
      clientes: {
        total: totalClientes,
        conFinanciamiento: clientesConFinanciamiento.length
      },
      autos: {
        total: totalAutos,
        disponibles: autosDisponibles,
        financiados: autosFinanciados,
        vendidos: autosVendidos
      },
      pagos: {
        pendientes: pagosPendientes,
        vencidos: pagosVencidos,
        pagados: pagosPagados
      },
      permutas: {
        total: totalPermutas
      },
      proximosVencimientos,
      pagosVencidos: pagosVencidosDetalle,
      clientesConFinanciamiento
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas para empleado:', error);
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
