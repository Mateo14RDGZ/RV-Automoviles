# 📋 Variables de Entorno - Copiar y Pegar

**Plantilla para configurar rápidamente en Vercel**

---

## 🔐 VARIABLES OBLIGATORIAS

### 1. NODE_ENV
```
NODE_ENV=production
```

### 2. POSTGRES_PRISMA_URL
```
POSTGRES_PRISMA_URL=postgresql://[usuario]:[password]@[host].neon.tech/[database]?sslmode=require&pgbouncer=true
```
**⚠️ Reemplazar con tu URL de Neon (Pooled Connection)**
- Debe incluir `&pgbouncer=true` al final

### 3. DATABASE_URL
```
DATABASE_URL=postgresql://[usuario]:[password]@[host].neon.tech/[database]?sslmode=require
```
**⚠️ Reemplazar con tu URL de Neon (Direct Connection)**
- NO debe incluir pgbouncer

### 4. JWT_SECRET
```
JWT_SECRET=[TU_CLAVE_SECRETA_32_CARACTERES]
```
**⚠️ Generar en:** https://generate-secret.vercel.app/32
O con: `openssl rand -base64 32`

### 5. VITE_API_URL
```
VITE_API_URL=/api
```

---

## ➕ AGREGAR DESPUÉS DEL PRIMER DEPLOY

### 6. FRONTEND_URL
```
FRONTEND_URL=https://[tu-proyecto].vercel.app
```
**⚠️ Reemplazar con la URL que Vercel te asigne**

---

## 📧 VARIABLES OPCIONALES (Email)

### 7. EMAIL_USER (Opcional)
```
EMAIL_USER=tu-email@gmail.com
```

### 8. EMAIL_PASSWORD (Opcional)
```
EMAIL_PASSWORD=tu_app_password_de_gmail
```

---

## 📝 EJEMPLO COMPLETO

Aquí está un ejemplo completo con valores ficticios (reemplázalos con los tuyos):

```env
# Obligatorias
NODE_ENV=production
POSTGRES_PRISMA_URL=postgresql://myuser:mypass123@ep-cool-mountain-123456.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
DATABASE_URL=postgresql://myuser:mypass123@ep-cool-mountain-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=8K9mP2xQ5nR7tY6uV4wX3zA1bC0dE9fG8hI7jK6lM5nO4pQ3rS2tU1vW0xY9zA8
VITE_API_URL=/api

# Agregar después del primer deploy
FRONTEND_URL=https://rv-automoviles-abc123.vercel.app

# Opcionales (para emails)
EMAIL_USER=contacto@miautomotora.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

---

## 🎯 CÓMO USARLO EN VERCEL

### Durante la Configuración Inicial:

1. En la pantalla de import de proyecto en Vercel
2. Expande **"Environment Variables"**
3. Para cada variable:
   - Click en **"Add New"**
   - Name: [nombre de la variable]
   - Value: [valor de la variable]
   - Selecciona: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

### Después del Primer Deploy:

1. Ve a tu proyecto en Vercel
2. **Settings** > **Environment Variables**
3. Click **"Add New"**
4. Agrega `FRONTEND_URL` con la URL de tu app
5. Ve a **Deployments** y redespliega

---

## ✅ CHECKLIST DE VARIABLES

Usa este checklist al configurar en Vercel:

- [ ] NODE_ENV
- [ ] POSTGRES_PRISMA_URL (con pgbouncer=true)
- [ ] DATABASE_URL (sin pgbouncer)
- [ ] JWT_SECRET
- [ ] VITE_API_URL
- [ ] FRONTEND_URL (después del primer deploy)
- [ ] EMAIL_USER (opcional)
- [ ] EMAIL_PASSWORD (opcional)

---

## 🔍 VERIFICAR QUE ESTÁN CORRECTAS

### Después de configurarlas:

1. Ve a **Settings** > **Environment Variables**
2. Verifica que estén todas
3. Verifica que los valores sean correctos
4. Verifica que estén seleccionadas para Production

### Señales de que algo está mal:

❌ Deploy falla con error de Prisma → Verifica URLs de database
❌ Login no funciona → Verifica JWT_SECRET
❌ API no responde → Verifica VITE_API_URL

---

## 🆘 PROBLEMAS COMUNES

### "Cannot connect to database"
- Verifica que POSTGRES_PRISMA_URL tenga `pgbouncer=true`
- Verifica que DATABASE_URL NO tenga pgbouncer
- Verifica que las URLs sean de Neon y estén correctas

### "JWT malformed"
- Verifica que JWT_SECRET tenga al menos 32 caracteres
- Verifica que no tenga espacios al principio o final
- Genera una nueva con: https://generate-secret.vercel.app/32

### "API not found"
- Verifica que VITE_API_URL sea exactamente: `/api`
- No debe tener espacios
- No debe tener http:// ni https://

---

## 📚 MÁS INFORMACIÓN

- 🚀 [Guía Rápida de Deploy](DEPLOY_RAPIDO.md)
- 📖 [Guía Completa Paso a Paso](DEPLOY_VERCEL_NEON.md)
- ✅ [Checklist Detallado](CHECKLIST_DEPLOY.md)
- 📝 [Variables Explicadas](VARIABLES_ENTORNO_VERCEL.md)

---

**¡Buena suerte con tu configuración! 🚀**
