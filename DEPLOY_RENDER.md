# Guía de Deploy - Backend en Render.com + Frontend en Vercel

## 🎯 ARQUITECTURA

- **Frontend:** Vercel (estático)
- **Backend:** Render.com (servidor Node.js persistente)
- **Base de Datos:** Neon PostgreSQL

## 📦 PASO 1: DEPLOY DEL BACKEND EN RENDER.COM

### 1.1 Crear cuenta en Render
1. Ve a: https://render.com
2. Crea una cuenta (puedes usar GitHub)

### 1.2 Crear Web Service
1. Click en "New +" > "Web Service"
2. Conecta tu repositorio de GitHub: `Gestio_RV_Automoviles`
3. Configuración:
   - **Name:** `rv-automoviles-backend`
   - **Region:** Oregon (US West) o el más cercano
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### 1.3 Agregar Variables de Entorno
En la sección "Environment Variables", agrega:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `JWT_SECRET` | `rv_automoviles_secret_key_2025_super_seguro` |
| `POSTGRES_PRISMA_URL` | Tu URL de Neon (con pgbouncer=true) |
| `DATABASE_URL_UNPOOLED` | Tu URL de Neon (sin pgbouncer) |
| `FRONTEND_URL` | `https://gestio-rv-automoviles-3oo7.vercel.app` |

### 1.4 Deploy
1. Click en "Create Web Service"
2. Espera 3-5 minutos mientras Render despliega
3. Una vez terminado, verás una URL tipo: `https://rv-automoviles-backend.onrender.com`

### 1.5 Verificar Backend
Abre en tu navegador:
```
https://rv-automoviles-backend.onrender.com/api/health
```

Deberías ver:
```json
{
  "status": "OK",
  "message": "RV Automoviles API está funcionando correctamente"
}
```

## 📦 PASO 2: CONFIGURAR FRONTEND EN VERCEL

### 2.1 Actualizar Variable de Entorno
1. Ve a Vercel Dashboard: https://vercel.com/dashboard
2. Abre tu proyecto: `Gestio_RV_Automoviles`
3. Ve a Settings > Environment Variables
4. **EDITA** la variable `VITE_API_URL`:
   - **Valor nuevo:** `https://rv-automoviles-backend.onrender.com/api`
   - (Reemplaza `rv-automoviles-backend` con el nombre de tu servicio en Render)

### 2.2 Redeploy
1. Ve a Deployments
2. Click en "Redeploy" en el último deployment
3. Espera 2-3 minutos

## ✅ PASO 3: VERIFICAR TODO FUNCIONA

### Frontend
https://gestio-rv-automoviles-3oo7.vercel.app

### Backend
https://rv-automoviles-backend.onrender.com/api/health

### Base de Datos
El backend se conectará automáticamente a Neon con las variables configuradas.

## 🔧 MIGRACIONES DE BASE DE DATOS (Solo primera vez)

Desde tu terminal local:

```powershell
cd backend
$env:POSTGRES_PRISMA_URL="TU_URL_DE_NEON_CON_PGBOUNCER"
$env:DATABASE_URL_UNPOOLED="TU_URL_DE_NEON_SIN_PGBOUNCER"
npx prisma db push
```

## ⚠️ IMPORTANTE

### Render Free Tier
- El servicio gratuito de Render se "duerme" después de 15 minutos de inactividad
- La primera petición después de dormir tarda ~30 segundos en responder
- Para mantenerlo activo 24/7, necesitas un plan de pago ($7/mes)

### Alternativa: Agregar Cron Job
Puedes crear un cron job gratuito en cron-job.org que haga ping a tu backend cada 10 minutos:
```
https://rv-automoviles-backend.onrender.com/api/health
```

## 🚀 VENTAJAS DE ESTA CONFIGURACIÓN

✅ Backend siempre disponible (servidor persistente)
✅ Conexión permanente a base de datos
✅ No hay límites de funciones serverless
✅ Logs en tiempo real
✅ Más fácil de debuggear
✅ Gratis (con limitaciones)

## 📊 MONITOREO

### Logs del Backend
1. Ve a Render Dashboard
2. Abre tu servicio
3. Click en "Logs" para ver logs en tiempo real

### Logs del Frontend
1. Ve a Vercel Dashboard
2. Abre tu proyecto
3. Click en "Deployments" > último deploy > "Logs"

---

**Creado:** 2025-11-01
**Estado:** Backend migrado de serverless a servidor persistente
