const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

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

const authRoutes = require('./routes/auth.routes');
const autosRoutes = require('./routes/autos.routes');
const clientesRoutes = require('./routes/clientes.routes');
const pagosRoutes = require('./routes/pagos.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

app.use('/api/auth', authRoutes);
app.use('/api/autos', autosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const prisma = require('./lib/prisma');
    // Verificar conexión a base de datos
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

// Endpoint de diagnóstico (solo para verificar configuración)
app.get('/api/diagnostic', (req, res) => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV ? '✅ Configurado' : '❌ No configurado',
    USE_MOCK_DB: process.env.USE_MOCK_DB ? '✅ ' + process.env.USE_MOCK_DB : '❌ No configurado',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Configurado (longitud: ' + process.env.JWT_SECRET.length + ')' : '❌ No configurado',
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ? '✅ Configurado' : '❌ No configurado',
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? '✅ Configurado' : '❌ No configurado',
    FRONTEND_URL: process.env.FRONTEND_URL || 'No configurado',
    VITE_API_URL: process.env.VITE_API_URL || 'No configurado'
  };

  res.json({
    message: 'Diagnóstico de variables de entorno',
    variables: envVars,
    modoDemo: process.env.USE_MOCK_DB === 'true' || !process.env.POSTGRES_PRISMA_URL,
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'API Gestión Automotora',
    version: '1.0.0'
  });
});

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
