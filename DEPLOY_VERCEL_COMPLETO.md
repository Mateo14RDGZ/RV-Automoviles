# Guía Completa: Deploy a Producción en Vercel con Backend y Base de Datos Neon

## 📋 PASO 1: Obtener la URL de Conexión de Neon

1. Ve a [Neon Console](https://console.neon.tech)
2. Selecciona tu proyecto
3. En la sección "Connection Details" o "Dashboard", copia el **Connection String**
4. Debe verse algo así:
   ```
   postgresql://usuario:password@ep-xxxxx-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## 📋 PASO 2: Configurar Variables de Entorno en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto: `Gestio_RV_Automoviles`
3. Ve a **Settings** > **Environment Variables**
4. Agrega las siguientes variables (haz clic en "Add" para cada una):

### Variables Requeridas:

| Name | Value | Environment |
|------|-------|-------------|
| `NODE_ENV` | `production` | Production, Preview, Development |
| `DATABASE_URL` | `TU_CONNECTION_STRING_DE_NEON` | Production, Preview, Development |
| `JWT_SECRET` | `tu_secreto_super_seguro_cambiar_en_produccion_12345` | Production, Preview, Development |
| `FRONTEND_URL` | `https://gestio-rv-automoviles.vercel.app` | Production, Preview, Development |
| `PORT` | `5000` | Production, Preview, Development |

### ⚠️ IMPORTANTE:
- Reemplaza `TU_CONNECTION_STRING_DE_NEON` con la URL real de tu base de datos
- Cambia `JWT_SECRET` por un valor único y seguro (mínimo 32 caracteres)
- Si tu dominio de Vercel es diferente, actualiza `FRONTEND_URL`

## 📋 PASO 3: Ejecutar Migraciones en Neon (Solo Primera Vez)

Desde tu terminal local, ejecuta:

```powershell
cd backend
$env:DATABASE_URL="TU_CONNECTION_STRING_DE_NEON"
npx prisma db push
npx prisma generate
```

Esto creará todas las tablas en tu base de datos Neon.

## 📋 PASO 4: Verificar vercel.json

El archivo `vercel.json` debe estar configurado correctamente (ya lo está):
- ✅ Frontend en `frontend/dist`
- ✅ Backend en `backend/api/index.js`
- ✅ Rutas API configuradas

## 📋 PASO 5: Deploy a Vercel

### Opción A: Deploy Automático (Recomendado)
```powershell
git add .
git commit -m "Configurar variables de entorno para producción"
git push origin main
```
Vercel detectará el push y desplegará automáticamente.

### Opción B: Deploy Manual
```powershell
cd frontend
npm run build
# Luego sube manualmente desde Vercel Dashboard
```

## 📋 PASO 6: Verificar el Deploy

1. Espera a que el deploy termine en Vercel (1-3 minutos)
2. Verifica el backend:
   - Abre: `https://gestio-rv-automoviles.vercel.app/api/health`
   - Deberías ver: `{"status":"OK","message":"RV Automoviles API está funcionando correctamente",...}`

3. Verifica el frontend:
   - Abre: `https://gestio-rv-automoviles.vercel.app`
   - Deberías ver la página de login

## 🔍 TROUBLESHOOTING

### Error: "No se pudo conectar a la base de datos"
- ✅ Verifica que `DATABASE_URL` esté correctamente configurada en Vercel
- ✅ Asegúrate de que la URL incluya `?sslmode=require`
- ✅ Verifica que la base de datos Neon esté activa (no en pausa)

### Error: "CORS Policy"
- ✅ Verifica que `FRONTEND_URL` en Vercel apunte al dominio correcto
- ✅ Asegúrate de incluir `https://` en la URL

### Error: "Prisma Client not initialized"
- ✅ Verifica que `postinstall` script esté en `backend/package.json`
- ✅ Re-deploy el proyecto en Vercel

## 📱 PASO 7: Seed de Datos Iniciales (Opcional)

Si necesitas poblar la base de datos con datos de prueba:

```powershell
cd backend
$env:DATABASE_URL="TU_CONNECTION_STRING_DE_NEON"
npm run prisma:seed
```

## ✅ CHECKLIST FINAL

- [ ] Variables de entorno configuradas en Vercel
- [ ] Migraciones ejecutadas en Neon (`prisma db push`)
- [ ] Código pusheado a GitHub
- [ ] Deploy completado en Vercel
- [ ] `/api/health` responde correctamente
- [ ] Frontend carga sin errores
- [ ] Login funciona correctamente
- [ ] Backend conectado a base de datos Neon

---

## 🆘 NECESITAS AYUDA?

Si encuentras algún error:
1. Ve a Vercel Dashboard > Tu Proyecto > Deployments
2. Haz clic en el último deployment
3. Ve a la pestaña "Functions" > "api/index.js" > "Logs"
4. Copia el error y pídeme ayuda

---

**Última actualización:** 2025-11-01
