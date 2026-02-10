# ✅ Checklist de Deploy en Vercel

**Usa este checklist para asegurarte de que no te olvides de nada**

---

## 📋 ANTES DE EMPEZAR

- [ ] Tienes cuenta en **Vercel** (https://vercel.com)
- [ ] Tienes cuenta en **Neon** (https://neon.tech)
- [ ] El código está en GitHub (✅ Ya está en: https://github.com/Mateo14RDGZ/RV-Automoviles.git)

---

## 🗄️ PASO 1: NEON - Crear Base de Datos

- [ ] 1.1 Crear proyecto en Neon Console
- [ ] 1.2 Copiar **POSTGRES_PRISMA_URL** (Pooled Connection con `pgbouncer=true`)
- [ ] 1.3 Copiar **DATABASE_URL** (Direct Connection sin pgbouncer)
- [ ] 1.4 Guardar ambas URLs en un lugar seguro

**URLs que necesitas:**
```
✅ POSTGRES_PRISMA_URL (con pgbouncer=true)
✅ DATABASE_URL (sin pgbouncer)
```

---

## 🚀 PASO 2: VERCEL - Importar Proyecto

- [ ] 2.1 Ir a Vercel Dashboard > Add New > Project
- [ ] 2.2 Seleccionar repositorio: `Mateo14RDGZ/RV-Automoviles`
- [ ] 2.3 Configuración detectada automáticamente:
  - Root: `./`
  - Build: `npm run build:vercel`
  - Output: `frontend/dist`
  - Install: `npm run install:vercel`

**⚠️ NO HACER DEPLOY TODAVÍA - Primero configurar variables**

---

## 🔐 PASO 3: VERCEL - Variables de Entorno

### Variables Obligatorias (6)

- [ ] 3.1 **NODE_ENV** = `production`
- [ ] 3.2 **POSTGRES_PRISMA_URL** = `[Pegar URL de Neon con pgbouncer=true]`
- [ ] 3.3 **DATABASE_URL** = `[Pegar URL de Neon sin pgbouncer]`
- [ ] 3.4 **JWT_SECRET** = `[Generar clave de 32+ caracteres]`
  - Genera en: https://generate-secret.vercel.app/32
  - O con: `openssl rand -base64 32`
- [ ] 3.5 **VITE_API_URL** = `/api`
- [ ] 3.6 **FRONTEND_URL** = `[Se agrega DESPUÉS del primer deploy]`

### Variables Opcionales (Email)

- [ ] 3.7 **EMAIL_USER** = `tu-email@gmail.com` (opcional)
- [ ] 3.8 **EMAIL_PASSWORD** = `app_password` (opcional)

**⚠️ IMPORTANTE: Marcar todas las variables para Production, Preview y Development**

---

## 🎯 PASO 4: DEPLOY INICIAL

- [ ] 4.1 Verificar que todas las variables estén configuradas
- [ ] 4.2 Hacer clic en **"Deploy"**
- [ ] 4.3 Esperar 3-5 minutos (monitorear logs)
- [ ] 4.4 Deploy completado ✅

---

## 🔗 PASO 5: AGREGAR FRONTEND_URL

- [ ] 5.1 Copiar URL de la app: `https://tu-app.vercel.app`
- [ ] 5.2 Ir a Settings > Environment Variables
- [ ] 5.3 Agregar **FRONTEND_URL** con la URL copiada
- [ ] 5.4 Ir a Deployments > Redeploy (último deploy)

---

## 👤 PASO 6: CREAR USUARIO ADMIN

**Opción A: Desde la App**
- [ ] 6.1 Ir a la URL de tu app
- [ ] 6.2 Registrar primer usuario como admin

**Opción B: SQL en Neon**
- [ ] 6.1 Ir a Neon Console > SQL Editor
- [ ] 6.2 Ejecutar script SQL para crear admin
  - Email: `admin@rvautomoviles.com`
  - Password: `admin123`

---

## ✅ PASO 7: VERIFICAR TODO

- [ ] 7.1 Abrir app: `https://tu-app.vercel.app`
- [ ] 7.2 Login con usuario admin
- [ ] 7.3 Verificar API: `https://tu-app.vercel.app/api`
- [ ] 7.4 Crear un cliente de prueba
- [ ] 7.5 Crear un auto de prueba
- [ ] 7.6 Registrar un pago de prueba
- [ ] 7.7 Todo funciona ✅

---

## 🎉 COMPLETADO

**Tu aplicación está lista en producción!**

🌐 **Frontend**: https://tu-app.vercel.app
🔌 **API**: https://tu-app.vercel.app/api
🗄️ **Database**: Neon PostgreSQL

---

## 🔄 Para Actualizar en el Futuro

```bash
# 1. Hacer cambios en tu código
# 2. Commit y push
git add .
git commit -m "Descripción de cambios"
git push origin main

# 3. Vercel autodeploys automáticamente
# 4. Espera 2-3 minutos
```

---

## 🆘 Si Algo Sale Mal

### Deploy falla
- [ ] Revisar logs en Vercel > Deployments > View Function Logs
- [ ] Verificar todas las variables de entorno
- [ ] Verificar que las URLs de Neon sean correctas

### No puedo hacer login
- [ ] Verificar JWT_SECRET en variables
- [ ] Verificar que el usuario admin existe en la base de datos
- [ ] Redeploy del proyecto

### Base de datos no funciona
- [ ] Verificar POSTGRES_PRISMA_URL (debe tener pgbouncer=true)
- [ ] Verificar DATABASE_URL (NO debe tener pgbouncer)
- [ ] Verificar en Neon que el proyecto está activo

---

**📖 Guía Detallada**: [DEPLOY_VERCEL_NEON.md](DEPLOY_VERCEL_NEON.md)
**📋 Variables Explicadas**: [VARIABLES_ENTORNO_VERCEL.md](VARIABLES_ENTORNO_VERCEL.md)
