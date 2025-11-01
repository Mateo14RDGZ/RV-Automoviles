require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const app = express();

// Inicializar Prisma Client con configuración para serverless
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Middleware para verificar conexión a base de datos en cada request
app.use(async (req, res, next) => {
  try {
    // Solo verificar en el primer request (lazy connection)
    if (!global.dbConnected) {
      await prisma.$connect();
      console.log('✅ Conexión a base de datos PostgreSQL exitosa');
      global.dbConnected = true;
    }
    next();
  } catch (error) {
    console.error('❌ ERROR: No se pudo conectar a la base de datos');
    console.error('Detalles:', error.message);
    return res.status(503).json({
      error: 'Servicio no disponible',
      message: 'No se pudo conectar a la base de datos. Por favor, intenta más tarde.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const autosRoutes = require('./routes/autos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const pagosRoutes = require('./routes/pagos.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// ===== SEGURIDAD =====

// 1. Helmet - Protección contra vulnerabilidades comunes
app.use(helmet());

// 2. CORS Restrictivo
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173', // Vite default port
  'https://gestio-rv-automoviles.vercel.app',
  'https://gestio-rv-automoviles-3oo7.vercel.app'
].filter(Boolean); // Filtrar valores undefined

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps, curl o same-origin)
    if (!origin) return callback(null, true);
    
    // En producción, permitir todos los dominios de Vercel
    if (process.env.NODE_ENV === 'production' && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 3. Rate Limiting General (100 peticiones por 15 minutos)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de peticiones
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// 4. Rate Limiting para Autenticación (5 intentos por 15 minutos)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de inicio de sesión, intenta de nuevo en 15 minutos',
  skipSuccessfulRequests: true // No cuenta intentos exitosos
});

// Middleware
app.use(express.json({ limit: '10mb' })); // Limitar tamaño de JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log de peticiones en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rutas (con rate limiting en auth)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/autos', autosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RV Automoviles API está funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api`);
  console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
});

// Exportar para compatibilidad
module.exports = app;
