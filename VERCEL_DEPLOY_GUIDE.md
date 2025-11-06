# 📘 Guía Completa de Deployment en Vercel

## Sistema de Gestión RV Automóviles

Esta guía te llevará paso a paso para deployar correctamente tu aplicación en Vercel con base de datos PostgreSQL en Neon.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Base de Datos (Neon)](#configuración-de-base-de-datos-neon)
3. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
4. [Deployment en Vercel](#deployment-en-vercel)
5. [Inicializar Base de Datos](#inicializar-base-de-datos)
6. [Verificación y Pruebas](#verificación-y-pruebas)
7. [Solución de Problemas](#solución-de-problemas)

---

## 1. Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Cuenta en [GitHub](https://github.com) (donde está tu código)
- ✅ Cuenta en [Vercel](https://vercel.com) (para el deployment)
- ✅ Cuenta en [Neon](https://neon.tech) (para la base de datos PostgreSQL)
- ✅ El código del proyecto en un repositorio de GitHub

---

## 2. Configuración de Base de Datos (Neon)

### Paso 2.1: Crear Proyecto en Neon

1. Ve a [https://neon.tech](https://neon.tech) e inicia sesión
2. Click en **"Create a project"**
3. Configura:
   - **Project name**: `rv-automoviles-db` (o el nombre que prefieras)
   - **Region**: Selecciona la más cercana a tus usuarios
   - **Postgres version**: Usa la versión más reciente (16 o superior)
4. Click **"Create project"**

### Paso 2.2: Obtener las Variables de Conexión

Una vez creado el proyecto, Neon te mostrará las cadenas de conexión. **Copia estas EXACTAMENTE**:

1. En el dashboard de Neon, ve a **"Connection Details"**
2. Copia estas 2 URLs:
   - **Pooled connection** → Esta es tu `POSTGRES_PRISMA_URL`
   - **Direct connection** → Esta es tu `POSTGRES_URL_NON_POOLING`

**Ejemplo de cómo se ven:**
```
POSTGRES_PRISMA_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
POSTGRES_URL_NON_POOLING=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

⚠️ **IMPORTANTE**: Guárdalas en un lugar seguro, las necesitarás en el siguiente paso.

---

## 3. Configuración de Variables de Entorno

### Paso 3.1: Generar JWT Secret

Necesitas una clave secreta para los tokens de autenticación.

**Opción A: Usando Node.js** (en tu terminal local):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Opción B: Online**:
Ve a [https://randomkeygen.com/](https://randomkeygen.com/) y copia una "CodeIgniter Encryption Key"

**Ejemplo de resultado:**
```
a3f8b9c2d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0
```

### Paso 3.2: Preparar tus Variables

Necesitarás estas **6 variables de entorno**:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Modo de ejecución |
| `POSTGRES_PRISMA_URL` | (copiada de Neon) | URL con pooling para queries |
| `POSTGRES_URL_NON_POOLING` | (copiada de Neon) | URL directa para migraciones |
| `JWT_SECRET` | (generada arriba) | Clave secreta para JWT |
| `FRONTEND_URL` | `https://tu-proyecto.vercel.app` | URL de tu frontend (la obtendrás después) |
| `VITE_API_URL` | `/api` | Ruta relativa para la API |

---

## 4. Deployment en Vercel

### Paso 4.1: Conectar Repositorio

1. Ve a [https://vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New Project"**
3. Selecciona **"Import Git Repository"**
4. Busca tu repositorio: `Mateo14RDGZ/Gestio_RV_Automoviles`
5. Click en **"Import"**

### Paso 4.2: Configurar el Proyecto

En la pantalla de configuración:

1. **Framework Preset**: Selecciona **"Other"**

2. **Root Directory**: Deja vacío (`.`)

3. **Build Command**: Deja vacío (usará el de `vercel.json`)

4. **Output Directory**: Deja vacío (usará el de `vercel.json`)

5. **Install Command**: Deja vacío (usará el de `vercel.json`)

### Paso 4.3: Agregar Variables de Entorno

⚠️ **CRÍTICO**: Debes agregar TODAS las variables ANTES del primer deploy.

1. En la misma pantalla, busca **"Environment Variables"**

2. Agrega cada variable una por una:

**Variable 1:**
- Name: `NODE_ENV`
- Value: `production`
- Environment: ✓ Production, ✓ Preview, ✓ Development

**Variable 2:**
- Name: `POSTGRES_PRISMA_URL`
- Value: (pega la URL de Neon con `pgbouncer=true`)
- Environment: ✓ Production, ✓ Preview, ✓ Development

**Variable 3:**
- Name: `POSTGRES_URL_NON_POOLING`
- Value: (pega la URL de Neon sin `pgbouncer`)
- Environment: ✓ Production, ✓ Preview, ✓ Development

**Variable 4:**
- Name: `JWT_SECRET`
- Value: (pega tu clave generada)
- Environment: ✓ Production, ✓ Preview, ✓ Development

**Variable 5:** (déjala vacía por ahora, la actualizaremos después)
- Name: `FRONTEND_URL`
- Value: `https://` (lo completarás después)
- Environment: ✓ Production

**Variable 6:**
- Name: `VITE_API_URL`
- Value: `/api`
- Environment: ✓ Production, ✓ Preview, ✓ Development

### Paso 4.4: Iniciar Deployment

1. Click en **"Deploy"**
2. Espera 2-4 minutos mientras Vercel construye tu aplicación
3. Si todo sale bien, verás ✅ **"Deployment Ready"**

### Paso 4.5: Obtener URL del Frontend

1. Una vez deployado, copia la URL de tu aplicación
   - Será algo como: `https://gestio-rv-automoviles-xxx.vercel.app`

2. Ve a **Settings** → **Environment Variables**

3. Busca la variable `FRONTEND_URL` y edítala:
   - Value: `https://gestio-rv-automoviles-xxx.vercel.app` (tu URL real)

4. **Guarda** los cambios

5. Ve a **Deployments** → último deploy → **"Redeploy"**

---

## 5. Inicializar Base de Datos

Ahora necesitas crear las tablas en tu base de datos.

### Paso 5.1: Instalar Prisma CLI (en tu computadora)

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
cd api
npm install
```

### Paso 5.2: Configurar Variables Locales

Crea un archivo `.env` en la carpeta `/api`:

```bash
# En PowerShell
@"
POSTGRES_PRISMA_URL=postgresql://user:password@...
POSTGRES_URL_NON_POOLING=postgresql://user:password@...
"@ | Out-File -FilePath ".env" -Encoding utf8
```

Reemplaza con tus URLs reales de Neon.

### Paso 5.3: Ejecutar Migraciones

```bash
npx prisma db push
```

Deberías ver:
```
✅ Database is now in sync with your schema
```

### Paso 5.4: Crear Usuario Administrador

Necesitas crear el primer usuario admin manualmente.

**Opción A: Usando Prisma Studio** (recomendado):

```bash
npx prisma studio
```

Esto abrirá una interfaz web. Haz lo siguiente:

1. Click en **"Usuario"**
2. Click en **"Add record"**
3. Completa:
   - `email`: `admin@rvautomoviles.com` (o tu email)
   - `password`: (genera un hash - ver abajo)
   - `rol`: `admin`
4. Click **"Save 1 change"**

**Para generar el hash de la contraseña**:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('TuContraseñaSegura123', 10).then(h=>console.log(h))"
```

Copia el resultado y pégalo en el campo `password`.

**Opción B: Usando código**:

Crea un archivo `seed.js` en `/api`:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@rvautomoviles.com',
      password: hashedPassword,
      rol: 'admin'
    }
  });
  
  console.log('✅ Usuario admin creado:', admin.email);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```

Ejecuta:
```bash
node seed.js
```

---

## 6. Verificación y Pruebas

### Paso 6.1: Verificar Frontend

1. Ve a tu URL de Vercel: `https://gestio-rv-automoviles-xxx.vercel.app`
2. Deberías ver la **página de login**
3. ✅ Si aparece correctamente, el frontend funciona

### Paso 6.2: Verificar API

Abre en tu navegador:
```
https://gestio-rv-automoviles-xxx.vercel.app/api/health
```

Deberías ver un JSON como:
```json
{
  "status": "OK",
  "message": "RV Automoviles API funcionando correctamente",
  "timestamp": "2025-11-06T..."
}
```

✅ Si ves esto, la API funciona.

### Paso 6.3: Probar Login

1. Ve a la página de login
2. Ingresa:
   - Email: `admin@rvautomoviles.com` (o el que creaste)
   - Contraseña: (la que usaste)
3. Click en **"Iniciar Sesión"**

✅ Si entras al dashboard, ¡todo funciona correctamente!

### Paso 6.4: Probar Funcionalidades

Verifica cada módulo:

- ✅ **Dashboard**: Muestra estadísticas
- ✅ **Clientes**: Crear, editar, eliminar
- ✅ **Autos**: Crear, editar, eliminar
- ✅ **Pagos**: Crear cuotas, registrar pagos
- ✅ **Reportes**: Generar PDFs

---

## 7. Solución de Problemas

### Error: "404 NOT_FOUND"

**Causa**: El frontend no se está sirviendo correctamente.

**Solución**:
1. Ve a Vercel → Settings → General
2. Verifica:
   - Framework: "Other"
   - Build Command: (vacío)
   - Output Directory: `frontend/dist`
3. Guarda y redeploy

### Error: "Failed to load resource: 404" en /api

**Causa**: Las funciones serverless no se están desplegando.

**Solución**:
1. Verifica que existe la carpeta `/api` en tu repo
2. Verifica que `vercel.json` tiene el rewrite correcto
3. Redeploy el proyecto

### Error: "Database connection failed"

**Causa**: Las variables de Neon no están configuradas correctamente.

**Solución**:
1. Ve a Neon dashboard y copia nuevamente las URLs
2. Asegúrate de que `POSTGRES_PRISMA_URL` tiene `?pgbouncer=true`
3. Asegúrate de que `POSTGRES_URL_NON_POOLING` NO tiene `pgbouncer`
4. Actualiza las variables en Vercel
5. Redeploy

### Error: "Token inválido" al hacer login

**Causa**: `JWT_SECRET` no está configurado o es diferente entre deployments.

**Solución**:
1. Genera un nuevo JWT_SECRET
2. Actualiza la variable en Vercel
3. Redeploy
4. Los usuarios existentes deberán volver a iniciar sesión

### Build falla con "vite: command not found"

**Causa**: Las dependencias del frontend no se instalaron.

**Solución**:
1. Verifica que `frontend/package.json` existe
2. Verifica que `vercel.json` tiene el buildCommand correcto
3. En Vercel Settings, borra cualquier Build Command manual
4. Redeploy

---

## 🎉 ¡Deployment Completado!

Tu aplicación ya está en producción. Puedes:

- ✅ Acceder desde cualquier dispositivo con internet
- ✅ Compartir la URL con tus usuarios
- ✅ El sistema se actualiza automáticamente con cada push a GitHub
- ✅ La base de datos está en Neon (backups automáticos)
- ✅ Todo es GRATIS (dentro de los límites de los planes free)

---

## 📊 Monitoreo y Mantenimiento

### Ver Logs de Errores

1. Ve a Vercel → Tu proyecto
2. Click en **Deployments**
3. Selecciona un deployment
4. Click en **"View Function Logs"**

### Actualizar la Aplicación

Simplemente haz cambios en tu código y:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin main
```

Vercel detectará el push y hará un nuevo deploy automáticamente.

### Actualizar Base de Datos (Schema)

Si cambias el schema de Prisma:

```bash
cd api
npx prisma db push
```

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs en Vercel
2. Verifica las variables de entorno
3. Asegúrate de que Neon esté activo
4. Verifica la conexión a internet

---

**¡Éxito con tu aplicación RV Automóviles! 🚗💨**
