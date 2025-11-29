const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

// Validadores
const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

const validateClienteLogin = [
  body('cedula')
    .trim()
    .isLength({ min: 8, max: 13 })
    .isNumeric()
    .withMessage('La cédula debe tener entre 8 y 13 dígitos numéricos')
];

// Registro de usuario
router.post('/register', validateRegister, async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        rol: 'admin'
      },
      select: {
        id: true,
        email: true,
        rol: true,
        createdAt: true,
      }
    });

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      user 
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login de usuario (admin con email+contraseña, cliente con cédula)
router.post('/login', validateLogin, async (req, res) => {
  try {
    console.log('🔐 Intentando login con:', req.body.email);
    
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Errores de validación:', errors.array());
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Verificar conexión a base de datos (Prisma se conecta automáticamente, pero verificamos)
    try {
      // Prisma se conecta automáticamente en el primer query, pero podemos verificar
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error('❌ Error de conexión a base de datos:', dbError);
      console.error('Error code:', dbError.code);
      console.error('Error message:', dbError.message);
      return res.status(503).json({ 
        error: 'Error de conexión a la base de datos',
        message: process.env.NODE_ENV === 'development' ? dbError.message : 'Verifica las variables de entorno POSTGRES_PRISMA_URL y POSTGRES_URL_NON_POOLING'
      });
    }

    // Buscar usuario por email
    console.log('🔍 Buscando usuario:', email);
    const user = await prisma.usuario.findFirst({ 
      where: { email },
      include: { cliente: true }
    });

    console.log('👤 Usuario encontrado:', user ? `ID: ${user.id}, Rol: ${user.rol}` : 'No encontrado');

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    console.log('🔑 Verificando contraseña...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('✅ Contraseña válida:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar que JWT_SECRET esté configurado
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no está configurado');
      return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    // Generar token con rol y clienteId
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        rol: user.rol,
        clienteId: user.clienteId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        clienteId: user.clienteId,
        cliente: user.cliente,
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    
    // Verificar si es un error de Prisma
    if (error.code === 'P1001' || error.code === 'P1000') {
      return res.status(503).json({ 
        error: 'Error de conexión a la base de datos',
        message: 'No se pudo conectar a la base de datos. Verifica las variables de entorno.'
      });
    }

    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// Login de cliente con cédula (solo si tiene pagos pendientes)
router.post('/login-cliente', validateClienteLogin, async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Cédula inválida', 
        details: errors.array() 
      });
    }

    const { cedula } = req.body;

    // Buscar cliente por cédula
    const cliente = await prisma.cliente.findUnique({
      where: { cedula },
      include: { 
        usuario: true,
        autos: {
          include: {
            pagos: {
              where: { estado: 'pendiente' }
            }
          }
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar si tiene pagos pendientes
    const tienePagosPendientes = cliente.autos.some(auto => auto.pagos.length > 0);
    
    if (!tienePagosPendientes) {
      return res.status(403).json({ 
        error: 'No tienes pagos pendientes. Contacta con administración para más información.' 
      });
    }

    // Verificar que el cliente tenga usuario
    if (!cliente.usuario) {
      return res.status(403).json({ 
        error: 'Cliente no tiene acceso al sistema. Contacta con administración.' 
      });
    }

    // Generar token sin necesidad de contraseña
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
      message: 'Login exitoso',
      token,
      user: {
        id: cliente.usuario.id,
        email: cliente.usuario.email,
        rol: cliente.usuario.rol,
        clienteId: cliente.id,
        cliente: {
          id: cliente.id,
          nombre: cliente.nombre,
          cedula: cliente.cedula,
          telefono: cliente.telefono,
          email: cliente.email
        }
      }
    });
  } catch (error) {
    console.error('Error en login de cliente:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ valid: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: { cliente: true }
    });

    if (!user) {
      return res.status(401).json({ valid: false });
    }

    res.json({ 
      valid: true, 
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        clienteId: user.clienteId,
        cliente: user.cliente
      }
    });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
