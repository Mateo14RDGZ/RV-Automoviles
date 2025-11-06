const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../../api/lib/prisma');

// Validadores
const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('nombre').trim().isLength({ min: 2 }).withMessage('El nombre es requerido')
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

    const { nombre, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
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
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await prisma.usuario.findUnique({ 
      where: { email },
      include: { cliente: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
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
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
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
