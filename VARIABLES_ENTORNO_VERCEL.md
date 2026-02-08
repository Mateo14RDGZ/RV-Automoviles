# 🔐 Variables de Entorno para Vercel

Este documento contiene todas las variables de entorno necesarias para hacer el deploy de la aplicación en Vercel.

## 📋 Variables Requeridas (Obligatorias)

### 1. **NODE_ENV**
```
NODE_ENV=production
```
- **Descripción**: Define el entorno de ejecución
- **Valor**: `production`

### 2. **POSTGRES_PRISMA_URL**
```
POSTGRES_PRISMA_URL=postgresql://usuario:password@host.neon.tech/database?sslmode=require&pgbouncer=true
```
- **Descripción**: URL de conexión a la base de datos PostgreSQL en Neon (con pgbouncer)
- **Cómo obtenerla**: 
  1. Ve a tu proyecto en [Neon Console](https://console.neon.tech)
  2. Ve a la sección "Connection Details"
  3. Copia la URL que dice "Pooled connection" o "Connection string" (con pgbouncer)
- **Importante**: Debe incluir `?sslmode=require&pgbouncer=true` al final

### 3. **DATABASE_URL**
```
DATABASE_URL=postgresql://usuario:password@host.neon.tech/database?sslmode=require
```
- **Descripción**: URL de conexión directa a PostgreSQL (sin pgbouncer) - usada para migraciones
- **Cómo obtenerla**: 
  1. En Neon Console, copia la URL que dice "Direct connection" o "Non-pooled connection"
  2. Debe incluir `?sslmode=require` pero NO `pgbouncer=true`
- **Nota**: Si no la configuras, se usará POSTGRES_PRISMA_URL como fallback

### 4. **JWT_SECRET**
```
JWT_SECRET=tu_clave_secreta_super_segura_minimo_32_caracteres_2025
```
- **Descripción**: Clave secreta para firmar y verificar tokens JWT
- **Cómo generarla**: 
  - Puedes usar: `openssl rand -base64 32`
  - O generar una cadena aleatoria de al menos 32 caracteres
- **Importante**: Debe ser única y segura. No la compartas públicamente.

### 5. **FRONTEND_URL**
```
FRONTEND_URL=https://tu-app.vercel.app
```
- **Descripción**: URL completa de tu aplicación desplegada en Vercel
- **Ejemplo**: `https://rv-automoviles.vercel.app`
- **Nota**: Reemplaza `tu-app.vercel.app` con la URL real que Vercel te asigne

### 6. **VITE_API_URL**
```
VITE_API_URL=/api
```
- **Descripción**: URL base para las peticiones de la API desde el frontend
- **Valor**: `/api` (ruta relativa)
- **Nota**: En producción siempre debe ser `/api` porque la API está en el mismo dominio

## 🔧 Variables Opcionales

### 7. **EMAIL_USER** (Opcional)
```
EMAIL_USER=tu-email@gmail.com
```
- **Descripción**: Email para enviar notificaciones (si habilitas el servicio de email)
- **Requerido**: Solo si quieres enviar emails de confirmación de pagos

### 8. **EMAIL_PASSWORD** (Opcional)
```
EMAIL_PASSWORD=tu_app_password_de_gmail
```
- **Descripción**: Contraseña de aplicación de Gmail (no tu contraseña normal)
- **Requerido**: Solo si configuraste EMAIL_USER
- **Cómo obtenerla**: 
  1. Ve a tu cuenta de Google
  2. Seguridad > Verificación en 2 pasos > Contraseñas de aplicaciones
  3. Genera una nueva contraseña de aplicación

## 📝 Instrucciones para Configurar en Vercel

### Paso 1: Acceder a la Configuración
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**

### Paso 2: Agregar Variables
Para cada variable de entorno:

1. Haz clic en **Add New**
2. Ingresa el **Name** (nombre de la variable)
3. Ingresa el **Value** (valor de la variable)
4. Selecciona los **Environments** donde aplicará:
   - ✅ Production
   - ✅ Preview (opcional)
   - ✅ Development (opcional)
5. Haz clic en **Save**

### Paso 3: Orden Recomendado
Agrega las variables en este orden:

1. `NODE_ENV` = `production`
2. `POSTGRES_PRISMA_URL` = (tu URL de Neon con pgbouncer)
3. `DATABASE_URL` = (tu URL de Neon sin pgbouncer)
4. `JWT_SECRET` = (tu clave secreta generada)
5. `FRONTEND_URL` = (tu URL de Vercel - puedes actualizarla después del primer deploy)
6. `VITE_API_URL` = `/api`
7. `EMAIL_USER` = (opcional)
8. `EMAIL_PASSWORD` = (opcional)

### Paso 4: Verificar
Después de agregar todas las variables:

1. Ve a **Deployments**
2. Haz clic en los tres puntos del último deployment
3. Selecciona **Redeploy**
4. Verifica que el build sea exitoso

## ⚠️ Importante

- **Nunca** compartas tus variables de entorno públicamente
- **Nunca** subas archivos `.env` al repositorio
- **Siempre** usa valores diferentes para `JWT_SECRET` en producción
- **Verifica** que `FRONTEND_URL` coincida con tu dominio real en Vercel

## 🔍 Verificar Variables Configuradas

Puedes verificar que las variables estén configuradas correctamente:

1. En Vercel Dashboard, ve a **Settings** > **Environment Variables**
2. Deberías ver todas las variables listadas
3. Los valores están ocultos por seguridad (solo se muestran los últimos 4 caracteres)

## 🆘 Solución de Problemas

### Error: "Database URL not configured"
- Verifica que `POSTGRES_PRISMA_URL` o `DATABASE_URL` estén configuradas
- Asegúrate de que la URL sea válida y accesible

### Error: "JWT_SECRET is not defined"
- Verifica que `JWT_SECRET` esté configurada
- Asegúrate de que tenga al menos 32 caracteres

### Error: "CORS policy"
- Verifica que `FRONTEND_URL` coincida exactamente con tu dominio en Vercel
- Incluye el protocolo `https://`

### Error de conexión a la base de datos
- Verifica que la URL de Neon sea correcta
- Asegúrate de que `POSTGRES_PRISMA_URL` tenga `pgbouncer=true`
- Verifica que `DATABASE_URL` NO tenga `pgbouncer=true`

---

**Última actualización**: 2025-01-XX
**Repositorio**: https://github.com/Mateo14RDGZ/RV-Automoviles
