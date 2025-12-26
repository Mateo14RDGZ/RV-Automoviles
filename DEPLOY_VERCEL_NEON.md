# 🚀 Guía de Deploy en Vercel con Base de Datos Neon

Esta guía te ayudará a desplegar la aplicación Quesada Automoviles en Vercel y conectarla a una base de datos Neon PostgreSQL.

---

## 📋 Prerequisitos

1. ✅ Cuenta en [GitHub](https://github.com)
2. ✅ Cuenta en [Vercel](https://vercel.com) (gratis)
3. ✅ Cuenta en [Neon](https://neon.tech) (gratis)
4. ✅ Repositorio creado en GitHub: `Mateo14RDGZ/QuesadaAutomoviles`

---

## 🔧 Paso 1: Crear Base de Datos en Neon

1. Ve a [console.neon.tech](https://console.neon.tech)
2. Inicia sesión o crea una cuenta
3. Crea un nuevo proyecto:
   - Click en "New Project"
   - Nombre: `quesada-automoviles` (o el que prefieras)
   - Selecciona una región cercana (ej: `US East`)
   - Click "Create Project"

4. **Importante**: Una vez creado el proyecto, copia las **dos URLs de conexión**:
   - **Connection string** (con pooler) → Esta es la `POSTGRES_PRISMA_URL`
   - **Connection string** (sin pooler) → Esta es la `POSTGRES_URL_NON_POOLING`

   Ejemplo:
   ```
   # Con pooler (usar esta para POSTGRES_PRISMA_URL)
   postgresql://user:password@ep-xxxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   
   # Sin pooler (usar esta para POSTGRES_URL_NON_POOLING)
   postgresql://user:password@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

5. Guarda estas URLs, las necesitarás en el siguiente paso.

---

## 🔐 Paso 2: Configurar Variables de Entorno en Vercel

### 2.1. Crear Proyecto en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Inicia sesión con GitHub
3. Importa tu repositorio: `Mateo14RDGZ/QuesadaAutomoviles`
4. **Configuración inicial**:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./` (raíz)
   - **Build Command**: `npm run build:vercel` (se detecta automáticamente)
   - **Output Directory**: `frontend/dist` (se detecta automáticamente)
   - **Install Command**: `npm run install:vercel` (se detecta automáticamente)

5. **NO hagas deploy aún**, primero configura las variables de entorno.

### 2.2. Agregar Variables de Entorno

1. En la página de configuración del proyecto, ve a la sección **Environment Variables**
2. Agrega las siguientes variables (marca **Production**, **Preview** y **Development**):

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Entorno de ejecución |
| `POSTGRES_PRISMA_URL` | `postgresql://...` (URL con pooler de Neon) | URL de conexión con pooling |
| `POSTGRES_URL_NON_POOLING` | `postgresql://...` (URL sin pooler de Neon) | URL de conexión sin pooling |
| `DATABASE_URL` | `postgresql://...` (misma que POSTGRES_PRISMA_URL) | URL para Prisma (opcional, se mapea automáticamente) |
| `JWT_SECRET` | Genera uno con: `openssl rand -hex 32` | Secreto para tokens JWT |
| `VITE_API_URL` | `/api` | URL relativa de la API |
| `FRONTEND_URL` | `https://tu-proyecto.vercel.app` | Se actualiza después del primer deploy |

**Ejemplo de variables**:

```
NODE_ENV=production
POSTGRES_PRISMA_URL=postgresql://user:pass@ep-xxxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://user:pass@ep-xxxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL=postgresql://user:pass@ep-xxxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=a1b2c3d4e5f6... (genera uno seguro)
VITE_API_URL=/api
FRONTEND_URL=https://quesada-automoviles.vercel.app
```

3. Click **Save** después de agregar cada variable

---

## 🚀 Paso 3: Deploy en Vercel

1. Después de agregar todas las variables, click en **Deploy**
2. Espera 3-5 minutos mientras Vercel:
   - Instala dependencias
   - Genera el cliente de Prisma
   - Sincroniza el schema de la base de datos
   - Construye el frontend
   - Despliega la aplicación

3. Una vez completado el deploy, Vercel te dará una URL como:
   ```
   https://quesada-automoviles-xxxxx.vercel.app
   ```

---

## 🔄 Paso 4: Actualizar FRONTEND_URL

1. Copia la URL que te dio Vercel
2. Ve a tu proyecto en Vercel Dashboard
3. Ve a **Settings** → **Environment Variables**
4. Edita `FRONTEND_URL` y actualízala con tu URL real
5. Guarda los cambios
6. Ve a **Deployments** → Selecciona el último deployment → **⋮** → **Redeploy**

---

## 🗄️ Paso 5: Inicializar Base de Datos

Después del primer deploy, necesitas inicializar las tablas en la base de datos:

### Opción A: Desde Vercel (Recomendado)

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Deployments** → Selecciona el último deployment
3. Click en **View Function Logs**
4. Busca mensajes de Prisma para verificar que las tablas se crearon

### Opción B: Desde tu máquina local

1. Crea un archivo `.env` local (copia de `.env.example`)
2. Agrega tu `DATABASE_URL` de Neon
3. Ejecuta:

```bash
cd api
npx prisma generate
npx prisma db push
```

### Opción C: Crear Admin Manualmente

Puedes crear el primer usuario admin directamente desde la consola de Neon o usando un script:

```bash
cd api
node generate-admin.js
```

O crea un usuario manualmente insertando en la tabla `Usuario`:

```sql
-- Contraseña: Admin123! (hasheada con bcrypt)
INSERT INTO "Usuario" (email, password, rol, "createdAt", "updatedAt")
VALUES (
  'admin@quesadaautomoviles.com',
  '$2a$10$...',  -- Genera el hash con bcrypt
  'admin',
  NOW(),
  NOW()
);
```

---

## ✅ Paso 6: Verificar que Todo Funciona

### 6.1. Health Check

Abre en tu navegador:
```
https://tu-proyecto.vercel.app/api/health
```

Deberías ver:
```json
{
  "status": "OK",
  "database": {
    "connected": true,
    "url": "Configurada",
    "counts": {
      "autos": 0,
      "clientes": 0,
      "pagos": 0
    }
  }
}
```

### 6.2. Diagnostic

Abre en tu navegador:
```
https://tu-proyecto.vercel.app/api/diagnostic
```

Todas las variables deberían mostrar ✅

### 6.3. Login

1. Ve a: `https://tu-proyecto.vercel.app`
2. Intenta hacer login con las credenciales que creaste

---

## 🐛 Solución de Problemas

### Error: "DATABASE_URL no está configurada"

**Solución**: 
- Verifica que `POSTGRES_PRISMA_URL` esté configurada en Vercel
- Haz redeploy después de agregar las variables

### Error: "Connection timeout" o "ECONNREFUSED"

**Solución**:
- Verifica que la URL de Neon sea correcta
- Asegúrate de usar la URL con `sslmode=require`
- Verifica que tu proyecto de Neon esté activo

### Error 500 en el login

**Solución**:
- Verifica `/api/diagnostic` - todas las variables deben estar ✅
- Revisa los logs en Vercel: Deployments → View Function Logs
- Asegúrate de que las tablas estén creadas (ejecuta `npx prisma db push`)

### Error de CORS

**Solución**:
- Actualiza `FRONTEND_URL` con tu URL real de Vercel
- Haz redeploy después de actualizar

### Las tablas no se crearon

**Solución**:
- Ejecuta manualmente: `npx prisma db push` desde tu máquina local
- O verifica los logs del build en Vercel para ver errores de Prisma

---

## 📚 Recursos Útiles

- **Dashboard Vercel**: https://vercel.com/dashboard
- **Dashboard Neon**: https://console.neon.tech
- **Documentación Prisma**: https://www.prisma.io/docs
- **Documentación Vercel**: https://vercel.com/docs

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en producción. Si tienes problemas, revisa los logs en Vercel o contacta al equipo de soporte.

