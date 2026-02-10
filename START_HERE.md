# ⚡ DEPLOY AHORA - Guía Ultra Rápida

**Sigue estos pasos exactamente en este orden**

---

## ANTES DE EMPEZAR

Abre estos 3 links en pestañas separadas:
1. https://console.neon.tech (Neon)
2. https://vercel.com/dashboard (Vercel)
3. https://generate-secret.vercel.app/32 (Generar JWT)

---

## 📋 PASO A PASO

### 1. NEON (3 minutos)

```
✅ Login en Neon Console
✅ New Project → Nombre: "rv-automoviles"
✅ Copiar URL con pgbouncer=true (POSTGRES_PRISMA_URL)
✅ Copiar URL sin pgbouncer (DATABASE_URL)
```

### 2. GENERAR JWT (30 segundos)

```
✅ Ir a: https://generate-secret.vercel.app/32
✅ Copiar el resultado
```

### 3. VERCEL (2 minutos)

```
✅ Login en Vercel Dashboard
✅ Add New → Project
✅ Importar: Mateo14RDGZ/RV-Automoviles
✅ NO hacer deploy todavía
```

### 4. VARIABLES EN VERCEL (3 minutos)

Expandir "Environment Variables" y agregar:

```
NAME: NODE_ENV
VALUE: production
ENVS: ✅ Production ✅ Preview ✅ Development
---
NAME: POSTGRES_PRISMA_URL
VALUE: [Pegar URL con pgbouncer=true]
ENVS: ✅ Production ✅ Preview ✅ Development
---
NAME: DATABASE_URL
VALUE: [Pegar URL sin pgbouncer]
ENVS: ✅ Production ✅ Preview ✅ Development
---
NAME: JWT_SECRET
VALUE: [Pegar clave generada]
ENVS: ✅ Production ✅ Preview ✅ Development
---
NAME: VITE_API_URL
VALUE: /api
ENVS: ✅ Production ✅ Preview ✅ Development
```

### 5. DEPLOY (5 minutos)

```
✅ Click "Deploy"
✅ Esperar que termine (3-5 min)
✅ Copiar URL de la app
```

### 6. AGREGAR FRONTEND_URL (1 minuto)

```
✅ Settings → Environment Variables
✅ Add New
   NAME: FRONTEND_URL
   VALUE: [URL de tu app]
   ENVS: ✅ Todas
✅ Deployments → Redeploy
```

### 7. CREAR ADMIN (1 minuto)

```
✅ Ir a tu app
✅ Registrar primer usuario (será admin)
```

O en Neon SQL Editor:

```sql
INSERT INTO "Usuario" (email, password, rol, "createdAt", "updatedAt")
VALUES ('admin@rvautomoviles.com', 
        '$2a$10$rV9k1xN5C0FqEqxQZ8xGxeNLGYGy5Jz5C5Zp5Z5Z5Z5Z5Z5Z5Z5Zm',
        'admin', NOW(), NOW());
```
Login: admin@rvautomoviles.com / admin123

### 8. VERIFICAR (30 segundos)

```
✅ Abrir app
✅ Login
✅ Crear un cliente
✅ Funciona!
```

---

## ⏱️ TIEMPO TOTAL: ~15 minutos

---

## 🆘 SI ALGO SALE MAL

**Deploy falla:**
- Revisar logs en Vercel
- Verificar variables de entorno

**No funciona login:**
- Verificar JWT_SECRET
- Verificar que usuario existe
- Redeploy

**Error de base de datos:**
- POSTGRES_PRISMA_URL debe tener pgbouncer=true
- DATABASE_URL NO debe tener pgbouncer
- Verificar conexión en Neon

---

## 📚 GUÍAS COMPLETAS

Si necesitas más detalles:

- 🚀 [DEPLOY_RAPIDO.md](DEPLOY_RAPIDO.md) - Versión extendida
- 📖 [DEPLOY_VERCEL_NEON.md](DEPLOY_VERCEL_NEON.md) - Guía completa
- ✅ [CHECKLIST_DEPLOY.md](CHECKLIST_DEPLOY.md) - Checklist detallado
- 📋 [VARIABLES_TEMPLATE.md](VARIABLES_TEMPLATE.md) - Template de variables
- 🔐 [VARIABLES_ENTORNO_VERCEL.md](VARIABLES_ENTORNO_VERCEL.md) - Variables explicadas

---

## ✅ TODO LISTO

Tu aplicación estará en:
- 🌐 Frontend: https://tu-app.vercel.app
- 🔌 API: https://tu-app.vercel.app/api
- 🗄️ Database: Neon PostgreSQL

**¡Disfruta tu app en producción! 🎉**
