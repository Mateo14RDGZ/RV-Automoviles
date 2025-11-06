const express = require('express');// Función serverless de Vercel para manejar todas las peticiones API

const cors = require('cors');// Las variables de entorno son inyectadas automáticamente por Vercel

const helmet = require('helmet');

// Importar el servidor Express

const app = express();const app = require('../backend/server');



// Middleware de seguridad// Exportar como función serverless de Vercel

app.use(helmet());module.exports = app;


// CORS - permitir solo desde el frontend de Vercel
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  /\.vercel\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Importar rutas del backend original
const authRoutes = require('../backend/routes/auth.routes');
const autosRoutes = require('../backend/routes/autos.routes');
const clientesRoutes = require('../backend/routes/clientes.routes');
const pagosRoutes = require('../backend/routes/pagos.routes');
const dashboardRoutes = require('../backend/routes/dashboard.routes');

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/autos', autosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RV Automoviles API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Exportar como función serverless
module.exports = app;
