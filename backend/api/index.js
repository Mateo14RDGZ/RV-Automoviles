// Vercel Serverless Function Entry Point
// Este archivo se ejecuta en cada request en el entorno serverless de Vercel

// Importar la aplicación Express
const app = require('../server');

// Exportar para Vercel
module.exports = app;
