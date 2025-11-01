# CONFIGURACION DE VARIABLES DE ENTORNO EN VERCEL
# Sigue estos pasos para configurar tu proyecto en Vercel

## PASO 1: Obtener tu Connection String de Neon

1. Ve a: https://console.neon.tech
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto (o crea uno nuevo si no existe)
4. En el Dashboard, busca "Connection Details" o "Connection String"
5. Copia la URL completa que debe verse así:
   ```
   postgresql://usuario:password@ep-xxxxx-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## PASO 2: Configurar Variables en Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Busca y abre tu proyecto: **Gestio_RV_Automoviles**
3. Haz clic en **Settings** (arriba)
4. En el menú lateral, haz clic en **Environment Variables**
5. Agrega CADA una de estas variables (haz clic en "Add New" para cada una):

### Variable 1: NODE_ENV
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environments:** Marca las 3 opciones (Production, Preview, Development)
- Haz clic en **Save**

### Variable 2: DATABASE_URL
- **Name:** `DATABASE_URL`
- **Value:** `TU_CONNECTION_STRING_DE_NEON_AQUI`
  (Pega la URL que copiaste en el PASO 1)
- **Environments:** Marca las 3 opciones (Production, Preview, Development)
- Haz clic en **Save**

### Variable 3: JWT_SECRET
- **Name:** `JWT_SECRET`
- **Value:** `rv_automoviles_secret_key_2025_super_seguro_cambiar_en_produccion`
- **Environments:** Marca las 3 opciones (Production, Preview, Development)
- Haz clic en **Save**

### Variable 4: FRONTEND_URL
- **Name:** `FRONTEND_URL`
- **Value:** `https://gestio-rv-automoviles.vercel.app`
  (Si tu dominio es diferente, usa ese)
- **Environments:** Marca las 3 opciones (Production, Preview, Development)
- Haz clic en **Save**

### Variable 5: PORT
- **Name:** `PORT`
- **Value:** `5000`
- **Environments:** Marca las 3 opciones (Production, Preview, Development)
- Haz clic en **Save**

## PASO 3: Ejecutar Migraciones en Neon (SOLO LA PRIMERA VEZ)

Desde PowerShell, ejecuta estos comandos:

```powershell
cd backend
$env:DATABASE_URL="TU_CONNECTION_STRING_DE_NEON_AQUI"
npx prisma db push
npx prisma generate
```

IMPORTANTE: Reemplaza `TU_CONNECTION_STRING_DE_NEON_AQUI` con tu URL real de Neon.

## PASO 4: Hacer Deploy

Opción A - Deploy Automático (Recomendado):
```powershell
git add .
git commit -m "Configurar para produccion con Vercel y Neon"
git push origin main
```

Vercel detectará el push y desplegará automáticamente.

Opción B - Deploy Manual:
1. Ve a tu proyecto en Vercel Dashboard
2. Haz clic en **Deployments**
3. Haz clic en **Redeploy** en el último deployment

## PASO 5: Verificar que Todo Funcione

Espera 2-3 minutos después del deploy, luego verifica:

### 1. Backend Health Check
Abre en tu navegador:
https://gestio-rv-automoviles.vercel.app/api/health

Deberías ver algo como:
```json
{
  "status": "OK",
  "message": "RV Automoviles API está funcionando correctamente",
  "timestamp": "2025-11-01T..."
}
```

### 2. Frontend
Abre en tu navegador:
https://gestio-rv-automoviles.vercel.app

Deberías ver la página de login sin errores.

### 3. Verificar Logs (Si hay errores)
1. Ve a Vercel Dashboard > Tu Proyecto
2. Haz clic en **Deployments**
3. Haz clic en el último deployment (debe tener un checkmark verde)
4. Haz clic en **Functions** > **api/index.js**
5. Ve a la pestaña **Logs** para ver errores

## PROBLEMAS COMUNES

### Error: "No se pudo conectar a la base de datos"
✅ Solución:
- Verifica que `DATABASE_URL` esté correctamente configurada en Vercel
- Asegúrate de que la URL incluya `?sslmode=require` al final
- Verifica que tu base de datos en Neon esté activa (no en pausa)

### Error: "CORS Policy"
✅ Solución:
- Verifica que `FRONTEND_URL` en Vercel sea exactamente tu dominio
- Asegúrate de incluir `https://` (no `http://`)

### Error: "Cannot find module @prisma/client"
✅ Solución:
- Verifica que el script `postinstall` esté en `backend/package.json`
- Redeploy el proyecto en Vercel

### La página carga pero el backend no responde
✅ Solución:
- Verifica que todas las 5 variables de entorno estén configuradas
- Haz un Redeploy del proyecto
- Verifica los logs de la función serverless

## LISTO!

Una vez completados todos los pasos:
- ✅ Frontend funcionando
- ✅ Backend respondiendo en /api/*
- ✅ Base de datos conectada a Neon
- ✅ Variables de entorno configuradas
- ✅ Deploy automático desde GitHub

Tu aplicación está COMPLETAMENTE en producción!
