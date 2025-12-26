# 🔐 Variables de Entorno para Deploy (Sin Base de Datos)

Lista de variables de entorno necesarias para el deploy en Vercel, **excluyendo las relacionadas con la base de datos**.

---

## ✅ Variables Requeridas

### 1. `NODE_ENV`
**Descripción**: Define el entorno de ejecución  
**Valor para producción**: `production`  
**Requerida**: ✅ Sí

```env
NODE_ENV=production
```

---

### 2. `JWT_SECRET`
**Descripción**: Clave secreta para firmar y verificar tokens JWT de autenticación  
**Requerida**: ✅ Sí (CRÍTICA)  
**⚠️ IMPORTANTE**: Debes generar una clave segura única para producción

**Cómo generar una clave segura**:
```bash
# En Windows (PowerShell):
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# O usando OpenSSL (si está instalado):
openssl rand -hex 32

# O en Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Ejemplo**:
```env
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

### 3. `FRONTEND_URL`
**Descripción**: URL completa del frontend (usada para CORS y redirecciones)  
**Requerida**: ✅ Sí  
**Nota**: Actualiza esta URL después del primer deploy con tu URL real de Vercel

**Ejemplo inicial**:
```env
FRONTEND_URL=https://quesada-automoviles.vercel.app
```

**Ejemplo después del primer deploy**:
```env
FRONTEND_URL=https://quesada-automoviles-abc123.vercel.app
```

---

### 4. `VITE_API_URL`
**Descripción**: URL base de la API para el frontend  
**Valor para producción**: `/api` (ruta relativa)  
**Requerida**: ✅ Sí

```env
VITE_API_URL=/api
```

**Nota**: En desarrollo local usarías: `http://localhost:5000/api`

---

## 🔵 Variables Opcionales

### 5. `EMAIL_USER` (Opcional)
**Descripción**: Email para envío de correos (si implementas funcionalidad de emails)  
**Requerida**: ❌ No (hay valor por defecto)  
**Valor por defecto**: `mateorodriguez1026@gmail.com`

```env
EMAIL_USER=tu-email@gmail.com
```

---

### 6. `EMAIL_PASSWORD` (Opcional)
**Descripción**: Contraseña del email para envío de correos  
**Requerida**: ❌ No (solo si usas EMAIL_USER)

```env
EMAIL_PASSWORD=tu-contraseña-email
```

---

## 📋 Resumen Rápido

**Variables MÍNIMAS requeridas para deploy**:

```env
NODE_ENV=production
JWT_SECRET=tu_clave_secreta_generada_aqui
FRONTEND_URL=https://tu-proyecto.vercel.app
VITE_API_URL=/api
```

---

## 🚀 Configuración en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Settings → Environment Variables
3. Agrega cada variable:
   - **Name**: Nombre de la variable (ej: `JWT_SECRET`)
   - **Value**: Valor de la variable
   - **Environment**: Marca **Production**, **Preview** y **Development**
4. Click **Save**

**⚠️ IMPORTANTE**: 
- El `JWT_SECRET` debe ser **único y secreto** - nunca lo compartas públicamente
- Actualiza `FRONTEND_URL` después del primer deploy con tu URL real
- Todas las variables se pueden configurar para Production, Preview y Development

---

## 🔒 Seguridad

- ✅ **Nunca** commitees archivos `.env` al repositorio
- ✅ **Nunca** compartas `JWT_SECRET` públicamente
- ✅ Usa claves diferentes para desarrollo y producción
- ✅ Genera `JWT_SECRET` con un generador seguro (mínimo 32 caracteres)

---

## 📝 Ejemplo Completo de Configuración

```env
# ============================================
# REQUERIDAS
# ============================================
NODE_ENV=production
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
FRONTEND_URL=https://quesada-automoviles.vercel.app
VITE_API_URL=/api

# ============================================
# OPCIONALES (solo si usas emails)
# ============================================
# EMAIL_USER=tu-email@gmail.com
# EMAIL_PASSWORD=tu-contraseña
```

---

## ✅ Checklist de Configuración

Antes del deploy, verifica que tengas:

- [ ] `NODE_ENV` configurada como `production`
- [ ] `JWT_SECRET` generado y configurado (mínimo 32 caracteres)
- [ ] `FRONTEND_URL` configurada (puedes actualizarla después del primer deploy)
- [ ] `VITE_API_URL` configurada como `/api`
- [ ] Todas las variables marcadas para Production, Preview y Development en Vercel

---

**Nota**: Estas son solo las variables SIN base de datos. Para las variables de base de datos (Neon), consulta `DEPLOY_VERCEL_NEON.md`.

