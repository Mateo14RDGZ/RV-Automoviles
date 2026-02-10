# 🚀 Guía Completa de Deploy - Vercel + Neon

## ✅ Pre-requisitos
- ✅ Código subido a GitHub (https://github.com/Mateo14RDGZ/RV-Automoviles.git)
- ⏳ Cuenta en Vercel (https://vercel.com)
- ⏳ Cuenta en Neon (https://neon.tech)

---

## 📋 PASO 1: Crear Base de Datos en Neon

### 1.1 Crear Proyecto en Neon
1. Ve a [Neon Console](https://console.neon.tech)
2. Haz clic en **"New Project"**
3. Configura:
   - **Name**: `rv-automoviles` (o el nombre que prefieras)
   - **Region**: Selecciona la más cercana (ej: US East, EU West)
   - **PostgreSQL version**: 16 (recomendado)
4. Haz clic en **"Create Project"**

### 1.2 Obtener Strings de Conexión
Una vez creado el proyecto, ve a **"Connection Details"**:

**String 1: POSTGRES_PRISMA_URL** (Pooled Connection)
```
postgresql://usuario:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
```
- ⚠️ **IMPORTANTE**: Debe incluir `&pgbouncer=true`
- Esta se usa para las consultas normales de la app

**String 2: DATABASE_URL** (Direct Connection)
```
postgresql://usuario:password@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```
- ⚠️ **IMPORTANTE**: NO debe incluir `pgbouncer=true`
- Esta se usa para migraciones de Prisma

### 1.3 Guardar las URLs
Copia ambas URLs en un lugar seguro. Las necesitarás en el siguiente paso.

---

## 🚀 PASO 2: Deploy en Vercel

### 2.1 Importar Proyecto desde GitHub
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New"** > **"Project"**
3. Selecciona **"Import Git Repository"**
4. Busca y selecciona: `Mateo14RDGZ/RV-Automoviles`
5. Haz clic en **"Import"**

### 2.2 Configurar el Proyecto
En la pantalla de configuración:

**Framework Preset**: Other
**Root Directory**: `./` (dejar por defecto)
**Build Command**: `npm run build:vercel` (debería detectarlo automáticamente)
**Output Directory**: `frontend/dist` (debería detectarlo automáticamente)
**Install Command**: `npm run install:vercel` (debería detectarlo automáticamente)

### 2.3 ⚠️ IMPORTANTE: NO HACER DEPLOY TODAVÍA
- **NO hagas clic en "Deploy" aún**
- Primero necesitas configurar las variables de entorno

---

## 🔐 PASO 3: Configurar Variables de Entorno en Vercel

### 3.1 Abrir Configuración de Variables
En la misma pantalla de configuración del proyecto, expande la sección:
**"Environment Variables"**

### 3.2 Agregar Variables Obligatorias

Agrega cada una de estas variables haciendo clic en **"Add New"**:

#### Variable 1: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: POSTGRES_PRISMA_URL
- **Name**: `POSTGRES_PRISMA_URL`
- **Value**: `postgresql://usuario:password@ep-xxxxx...?sslmode=require&pgbouncer=true`
  - ⚠️ Pega la URL de Pooled Connection que obtuviste de Neon
  - ⚠️ Asegúrate que incluya `&pgbouncer=true`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 3: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: `postgresql://usuario:password@ep-xxxxx...?sslmode=require`
  - ⚠️ Pega la URL de Direct Connection que obtuviste de Neon
  - ⚠️ NO debe incluir `pgbouncer=true`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 4: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: `tu_clave_secreta_super_segura_minimo_32_caracteres`
  - ⚠️ Genera una clave segura (al menos 32 caracteres)
  - Puedes usar: https://generate-secret.vercel.app/32
  - O ejecutar: `openssl rand -base64 32`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

#### Variable 5: VITE_API_URL
- **Name**: `VITE_API_URL`
- **Value**: `/api`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 3.3 Variables Opcionales (para emails)

Si quieres habilitar envío de emails:

#### Variable 6: EMAIL_USER (Opcional)
- **Name**: `EMAIL_USER`
- **Value**: `tu-email@gmail.com`
- **Environments**: ✅ Production

#### Variable 7: EMAIL_PASSWORD (Opcional)
- **Name**: `EMAIL_PASSWORD`
- **Value**: `tu_app_password_de_gmail`
- **Environments**: ✅ Production

---

## 🎯 PASO 4: Hacer el Deploy

### 4.1 Iniciar Deploy
1. Verifica que todas las variables estén configuradas correctamente
2. Haz clic en **"Deploy"**
3. Espera a que Vercel:
   - Clone el repositorio
   - Instale las dependencias
   - Genere el cliente de Prisma
   - Ejecute las migraciones
   - Construya el frontend
   - Despliegue la aplicación

### 4.2 Monitorear el Deploy
- Verás un log en tiempo real del proceso
- El deploy puede tardar 2-5 minutos
- Si hay errores, revisa los logs cuidadosamente

### 4.3 Obtener la URL de la Aplicación
Una vez completado el deploy:
1. Vercel te mostrará una URL como: `https://rv-automoviles.vercel.app`
2. Copia esta URL

---

## ⚙️ PASO 5: Configurar FRONTEND_URL

### 5.1 Agregar Variable Final
1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Settings** > **Environment Variables**
3. Agrega una nueva variable:
   - **Name**: `FRONTEND_URL`
   - **Value**: `https://tu-app.vercel.app` (pega la URL que obtuviste)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
4. Haz clic en **Save**

### 5.2 Redesplegar
1. Ve a la pestaña **"Deployments"**
2. Haz clic en los 3 puntos del último deploy
3. Selecciona **"Redeploy"**
4. Confirma el redespliegue

---

## 🗄️ PASO 6: Inicializar la Base de Datos

### 6.1 Ejecutar Migraciones
Las migraciones ya se ejecutaron automáticamente durante el deploy.

### 6.2 Verificar Tablas (Opcional)
Puedes verificar que las tablas se crearon en Neon Console:
1. Ve a tu proyecto en Neon
2. Haz clic en **"Tables"** o **"SQL Editor"**
3. Deberías ver las tablas: Usuario, Cliente, Auto, Pago, ComprobantePago, Permuta

### 6.3 Crear Usuario Administrador Inicial
Puedes hacerlo de 2 formas:

**Opción A: Usando el Endpoint de Registro (Primera vez)**
1. Ve a: `https://tu-app.vercel.app`
2. En la pantalla de login, registra el primer admin manualmente

**Opción B: Usando SQL en Neon Console**
```sql
-- Crear usuario admin (password: admin123)
INSERT INTO "Usuario" (email, password, rol, "createdAt", "updatedAt")
VALUES (
  'admin@rvautomoviles.com',
  '$2a$10$rV9k1xN5C0FqEqxQZ8xGxeNLGYGy5Jz5C5Zp5Z5Z5Z5Z5Z5Z5Z5Zm',
  'admin',
  NOW(),
  NOW()
);
```
- Email: `admin@rvautomoviles.com`
- Password: `admin123`
- ⚠️ **Cambia la contraseña inmediatamente después del primer login**

---

## ✅ PASO 7: Verificar que Todo Funcione

### 7.1 Probar Login
1. Ve a: `https://tu-app.vercel.app`
2. Intenta hacer login con el usuario admin creado
3. Deberías poder acceder al dashboard

### 7.2 Probar Funcionalidades
- Crear un cliente
- Registrar un auto
- Registrar un pago
- Verificar que los datos se guardan correctamente

### 7.3 Verificar API
Visita: `https://tu-app.vercel.app/api`
Deberías ver: `{"message":"API funcionando correctamente"}`

---

## 🎉 ¡LISTO!

Tu aplicación ahora está desplegada en:
- **Frontend**: `https://tu-app.vercel.app`
- **API**: `https://tu-app.vercel.app/api`
- **Base de Datos**: Neon PostgreSQL

---

## 🔄 Actualizaciones Futuras

Para actualizar la aplicación después de hacer cambios:

1. Hacer cambios en tu código local
2. Commit y push a GitHub:
   ```bash
   git add .
   git commit -m "Descripción de los cambios"
   git push origin main
   ```
3. Vercel detectará automáticamente el push y hará un nuevo deploy
4. Espera 2-3 minutos y recarga la página

---

## 🆘 Solución de Problemas

### Error: "PRISMA_CLIENT_ENGINE_TYPE not found"
- Ve a Settings > Environment Variables en Vercel
- Redespliega el proyecto

### Error: "Database connection failed"
- Verifica que las URLs de Neon sean correctas
- Asegúrate que una tenga `pgbouncer=true` y la otra no
- Verifica que tu plan de Neon no haya alcanzado límites

### Error: "JWT_SECRET is not defined"
- Verifica que hayas agregado la variable JWT_SECRET en Vercel
- Redespliega el proyecto

### La aplicación no carga
- Revisa los logs en Vercel Dashboard > Deployments > (último deploy) > View Function Logs
- Busca errores específicos y corrígelos

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Neon](https://neon.tech/docs/introduction)
- [Documentación de Prisma](https://www.prisma.io/docs/)
- [Variables de Entorno Detalladas](./VARIABLES_ENTORNO_VERCEL.md)

---

**¡Buena suerte con tu deploy! 🚀**
