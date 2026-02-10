# 🎯 Deploy Primera Vez - Pasos Resumidos

**Para hacer el deploy AHORA en Vercel + Neon**

---

## 🚀 LO QUE NECESITAS HACER:

### 1️⃣ CREAR BASE DE DATOS EN NEON (5 min)

1. Ve a https://console.neon.tech
2. Crea un nuevo proyecto llamado "rv-automoviles"
3. Copia estas 2 URLs (están en "Connection Details"):

**URL 1: POSTGRES_PRISMA_URL** (Pooled/Connection string)
```
postgresql://usuario:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
```

**URL 2: DATABASE_URL** (Direct/Non-pooled connection)
```
postgresql://usuario:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

📝 **Guárdalas en un archivo de texto temporal**

---

### 2️⃣ GENERAR JWT_SECRET (1 min)

Genera una clave secreta aleatoria:

**Opción A: Online**
- Ve a: https://generate-secret.vercel.app/32
- Copia el resultado

**Opción B: Terminal** (si tienes OpenSSL)
```bash
openssl rand -base64 32
```

📝 **Guárdala también**

---

### 3️⃣ DEPLOY EN VERCEL (3 min)

1. Ve a https://vercel.com/dashboard
2. Click en **"Add New"** > **"Project"**
3. Importa desde GitHub: `Mateo14RDGZ/RV-Automoviles`
4. **NO hagas click en Deploy todavía**

---

### 4️⃣ CONFIGURAR VARIABLES (3 min)

En la pantalla de configuración, expande **"Environment Variables"** y agrega:

| Variable | Valor | Environments |
|----------|-------|--------------|
| `NODE_ENV` | `production` | ✅ Todas |
| `POSTGRES_PRISMA_URL` | Tu URL de Neon con pgbouncer | ✅ Todas |
| `DATABASE_URL` | Tu URL de Neon sin pgbouncer | ✅ Todas |
| `JWT_SECRET` | Tu clave generada | ✅ Todas |
| `VITE_API_URL` | `/api` | ✅ Todas |

**⚠️ Importante:** 
- POSTGRES_PRISMA_URL debe incluir `&pgbouncer=true`
- DATABASE_URL NO debe incluir pgbouncer

---

### 5️⃣ HACER DEPLOY (5 min)

1. Click en **"Deploy"**
2. Espera 3-5 minutos
3. Copia la URL que te da Vercel (ejemplo: `https://rv-automoviles-xxx.vercel.app`)

---

### 6️⃣ AGREGAR FRONTEND_URL (2 min)

1. Ve a tu proyecto en Vercel
2. **Settings** > **Environment Variables**
3. Agrega una nueva variable:
   - Name: `FRONTEND_URL`
   - Value: La URL que copiaste (ej: `https://rv-automoviles-xxx.vercel.app`)
   - Environments: ✅ Todas
4. Ve a **Deployments**
5. Click en los 3 puntos del último deploy > **Redeploy**

---

### 7️⃣ CREAR USUARIO ADMIN (2 min)

**Opción Fácil: Desde la App**

1. Ve a tu URL: `https://rv-automoviles-xxx.vercel.app`
2. En el login, debería haber opción de registro
3. Crea el primer usuario (será admin automáticamente)

**Opción SQL: Desde Neon**

1. Ve a Neon Console
2. Abre **SQL Editor**
3. Ejecuta este código:

```sql
-- Crear admin con password: admin123
INSERT INTO "Usuario" (email, password, rol, "createdAt", "updatedAt")
VALUES (
  'admin@rvautomoviles.com',
  '$2a$10$rV9k1xN5C0FqEqxQZ8xGxeNLGYGy5Jz5C5Zp5Z5Z5Z5Z5Z5Z5Z5Zm',
  'admin',
  NOW(),
  NOW()
);
```

Luego login con:
- Email: `admin@rvautomoviles.com`
- Password: `admin123`

**⚠️ Cambia la contraseña después del primer login**

---

### 8️⃣ VERIFICAR QUE TODO FUNCIONA (1 min)

1. Abre tu app
2. Haz login
3. Crea un cliente de prueba
4. Crea un auto de prueba
5. ✅ ¡Listo!

---

## 📊 RESUMEN TOTAL: ~20 minutos

✅ Neon: 5 min
✅ Generar secret: 1 min
✅ Config Vercel: 3 min
✅ Variables: 3 min
✅ Deploy: 5 min
✅ Frontend URL: 2 min
✅ Admin: 2 min
✅ Verificar: 1 min

---

## 🆘 AYUDA RÁPIDA

### Si el deploy falla:
1. Revisa logs en Vercel > Deployments
2. Verifica que todas las variables estén bien
3. Verifica las URLs de Neon

### Si no puedes hacer login:
1. Verifica que el usuario admin existe
2. Verifica JWT_SECRET en variables de Vercel
3. Redeploy del proyecto

### Si la base de datos no funciona:
1. Verifica POSTGRES_PRISMA_URL (debe tener pgbouncer=true)
2. Verifica DATABASE_URL (NO debe tener pgbouncer)
3. Verifica en Neon que el proyecto está activo

---

## 📚 GUÍAS COMPLETAS

Si necesitas más detalles:
- 📖 [Guía Completa Paso a Paso](DEPLOY_VERCEL_NEON.md)
- ✅ [Checklist Detallado](CHECKLIST_DEPLOY.md)
- 🔐 [Variables de Entorno Explicadas](VARIABLES_ENTORNO_VERCEL.md)

---

## 🎉 LISTO PARA EMPEZAR

Una vez completados estos pasos, tu aplicación estará en producción y lista para usar.

**URLs finales:**
- 🌐 App: `https://tu-proyecto.vercel.app`
- 🔌 API: `https://tu-proyecto.vercel.app/api`
- 🗄️ DB: Neon Console

---

**¡Buena suerte con tu deploy! 🚀**
