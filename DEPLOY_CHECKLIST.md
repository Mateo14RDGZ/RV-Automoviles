# ✅ Checklist de Deployment - RV Gestion Automotora

## ✅ Pre-Deployment (COMPLETADO)

- [x] Código corregido y optimizado
- [x] `api/index.js` - Servidor serverless limpio
- [x] `api/package.json` - Sin BOM, dependencias correctas
- [x] `api/prisma/schema.prisma` - Sin duplicaciones
- [x] `vercel.json` - Configuración optimizada
- [x] `frontend/package.json` - Scripts con npx vite build
- [x] Código subido a GitHub: https://github.com/Mateo14RDGZ/RV-Gestion-Automotora.git

## 📋 Paso 1: Variables de Entorno Iniciales en Vercel

En Vercel Dashboard → Settings → Environment Variables:

- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` = (Genera con: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)

## 🚀 Paso 2: Primer Deploy

- [ ] Click en "Deploy" en Vercel
- [ ] Esperar a que termine el build (frontend + api)
- [ ] Anotar la URL del proyecto (ej: `https://tu-proyecto.vercel.app`)

## 🌐 Paso 3: Variables de Frontend

Agregar en Vercel Environment Variables:

- [ ] `VITE_API_URL` = `https://tu-proyecto.vercel.app/api`
- [ ] `FRONTEND_URL` = `https://tu-proyecto.vercel.app`

## 🗄️ Paso 4: Configurar Neon Database

- [ ] Crear cuenta en https://neon.tech
- [ ] Crear nuevo proyecto PostgreSQL
- [ ] Copiar `POSTGRES_PRISMA_URL` (con pooling/pgbouncer=true)
- [ ] Copiar `POSTGRES_URL_NON_POOLING` (sin pooling)

Agregar en Vercel Environment Variables:

- [ ] `POSTGRES_PRISMA_URL` = (URL de Neon con pooling)
- [ ] `POSTGRES_URL_NON_POOLING` = (URL de Neon sin pooling)

## 🔄 Paso 5: Redeploy Final

- [ ] Click en "Redeploy" en Vercel Dashboard
- [ ] Verificar que el build se complete exitosamente
- [ ] Probar acceso al frontend
- [ ] Probar endpoint: `/api/health`
- [ ] Probar login de administrador

## 🎯 Verificación Final

- [ ] Frontend carga correctamente
- [ ] API responde en `/api/health`
- [ ] Login funciona
- [ ] Dashboard accesible
- [ ] No hay errores en consola de Vercel

## 📝 Configuración de Vercel (Automática)

El archivo `vercel.json` ya configura:
- ✅ Build del frontend con npm
- ✅ Instalación de dependencias de api
- ✅ Rutas `/api/*` hacia función serverless
- ✅ Configuración de Node.js para serverless

## 🔗 URLs y Referencias

- **Repositorio**: https://github.com/Mateo14RDGZ/RV-Gestion-Automotora.git
- **Vercel**: https://vercel.com
- **Neon**: https://neon.tech
- **API Health Check**: `/api/health`
- **API Base**: `/api`

## 🆘 Problemas Comunes (YA SOLUCIONADOS)

- ✅ BOM en package.json
- ✅ Schema duplicado en prisma
- ✅ Comando vite no encontrado
- ✅ CORS mal configurado
- ✅ Rutas 404 en API

## 📊 Estructura Final

```
Vercel Deploy:
├── Frontend (React + Vite) → Estático en CDN
├── API (Express Serverless) → /api/*
└── Base de Datos (Neon PostgreSQL)
```
- [ ] `VITE_API_URL` = `/api`

## Primer Deployment

- [ ] Click en "Deploy"
- [ ] Esperado 2-4 minutos
- [ ] Build exitoso ✅
- [ ] Frontend carga correctamente
- [ ] API responde en `/api/health`

## Post-Deployment

- [ ] Actualizar `FRONTEND_URL` con URL real de Vercel
- [ ] Redeploy después de actualizar FRONTEND_URL
- [ ] Ejecutar `npx prisma db push` localmente
- [ ] Crear usuario administrador inicial
- [ ] Probar login en producción
- [ ] Verificar todas las funcionalidades

## Verificación Final

- [ ] Dashboard muestra estadísticas
- [ ] Puede crear clientes
- [ ] Puede crear autos
- [ ] Puede generar cuotas
- [ ] Puede registrar pagos
- [ ] Exportar PDF funciona
- [ ] Login de cliente funciona
- [ ] No hay errores en consola

## Si Algo Falla

- [ ] Revisar logs en Vercel → Function Logs
- [ ] Verificar variables de entorno
- [ ] Comprobar conexión a Neon
- [ ] Leer sección "Solución de Problemas" en VERCEL_DEPLOY_GUIDE.md
- [ ] Redeploy

---

**Tiempo estimado total: 20-30 minutos**

**¿Todo listo?** 🎉 ¡Tu aplicación está en producción!
