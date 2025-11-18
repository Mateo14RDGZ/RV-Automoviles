# 🔧 Solución Error 500 en Login - Guía de Diagnóstico

## 🎯 Objetivo
Resolver el error 500 que aparece al intentar hacer login como administrador.

---

## 📋 Pasos de Diagnóstico

### Paso 1: Verificar Variables de Entorno

Abre en tu navegador:
```
https://rv-gestion-automotora20.vercel.app/api/diagnostic
```

**Deberías ver algo como:**
```json
{
  "message": "Diagnóstico de variables de entorno",
  "variables": {
    "NODE_ENV": "✅ Configurado",
    "JWT_SECRET": "✅ Configurado",
    "POSTGRES_PRISMA_URL": "✅ Configurado",
    "POSTGRES_URL_NON_POOLING": "✅ Configurado",
    "FRONTEND_URL": "https://rv-gestion-automotora20.vercel.app",
    "VITE_API_URL": "/api"
  }
}
```

**Si alguna variable muestra "❌ No configurado":**
1. Ve a Vercel → Settings → Environment Variables
2. Agrega la variable faltante
3. Haz redeploy

---

### Paso 2: Verificar Conexión a Base de Datos

Abre en tu navegador:
```
https://rv-gestion-automotora20.vercel.app/api/health
```

**Si funciona correctamente, verás:**
```json
{
  "status": "OK",
  "message": "RV Automoviles API funcionando correctamente",
  "database": "connected"
}
```

**Si hay error, verás:**
```json
{
  "status": "ERROR",
  "message": "Error de conexión a la base de datos",
  "database": "disconnected"
}
```

**Si la base de datos está desconectada:**
1. Verifica que las URLs de Neon sean correctas
2. Verifica que la base de datos en Neon esté activa
3. Verifica que las tablas estén creadas (ver Paso 3)

---

### Paso 3: Verificar que las Tablas Existan en la Base de Datos

**Opción A: Usando Prisma Studio (Recomendado)**

1. Abre tu terminal en la carpeta del proyecto
2. Ve a la carpeta `api`:
   ```bash
   cd api
   ```
3. Crea un archivo `.env` con tus URLs de Neon:
   ```powershell
   @"
   POSTGRES_PRISMA_URL=tu_url_con_pgbouncer
   POSTGRES_URL_NON_POOLING=tu_url_sin_pgbouncer
   "@ | Out-File -FilePath ".env" -Encoding utf8
   ```
4. Abre Prisma Studio:
   ```bash
   npx prisma studio
   ```
5. Se abrirá en `http://localhost:5555`
6. Verifica que existan las tablas:
   - `Usuario`
   - `Cliente`
   - `Auto`
   - `Pago`

**Si las tablas no existen:**
```bash
npx prisma db push
```

**Opción B: Verificar desde Neon Dashboard**

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto
3. Ve a "SQL Editor"
4. Ejecuta:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
5. Deberías ver: `Usuario`, `Cliente`, `Auto`, `Pago`

---

### Paso 4: Verificar que Exista un Usuario Admin

**Usando Prisma Studio:**

1. Abre Prisma Studio (ver Paso 3)
2. Haz clic en la tabla **"Usuario"**
3. Verifica que exista al menos un usuario con `rol = 'admin'`

**Si NO existe ningún usuario admin:**

#### Crear Usuario Admin - Opción A: Script

Crea un archivo `create-admin.js` en la carpeta `/api`:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@rvautomoviles.com';
  const password = 'Admin123!'; // Cambia esto por tu contraseña
  
  // Verificar si ya existe
  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) {
    console.log('✅ Usuario admin ya existe:', email);
    return;
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const admin = await prisma.usuario.create({
    data: {
      email,
      password: hashedPassword,
      rol: 'admin'
    }
  });
  
  console.log('✅ Usuario admin creado:');
  console.log('Email:', admin.email);
  console.log('Contraseña:', password);
  console.log('⚠️ Guarda estas credenciales en un lugar seguro');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Ejecuta:
```bash
node create-admin.js
```

#### Crear Usuario Admin - Opción B: Prisma Studio

1. Abre Prisma Studio
2. Haz clic en **"Usuario"**
3. Haz clic en **"Add record"** o el botón **"+"**
4. Genera el hash de la contraseña:
   ```bash
   node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('TuContraseña123', 10).then(h=>console.log(h))"
   ```
5. Completa los campos:
   - `email`: `admin@rvautomoviles.com`
   - `password`: (pega el hash generado)
   - `rol`: `admin`
6. Haz clic en **"Save 1 change"**

---

### Paso 5: Revisar Logs en Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto: `rv-gestion-automotora20`
3. Ve a **Deployments**
4. Haz clic en el último deployment
5. Haz clic en **"View Function Logs"** o **"Logs"**
6. Busca errores que empiecen con `❌`

**Errores comunes y soluciones:**

#### Error: "POSTGRES_PRISMA_URL no está configurada"
**Solución**: Agrega la variable en Vercel → Settings → Environment Variables

#### Error: "P1001: Can't reach database server"
**Solución**: 
- Verifica que las URLs de Neon sean correctas
- Verifica que Neon esté activo
- Verifica tu conexión a internet

#### Error: "JWT_SECRET no está configurado"
**Solución**: Agrega `JWT_SECRET` en Vercel → Settings → Environment Variables

#### Error: "relation 'Usuario' does not exist"
**Solución**: Las tablas no están creadas. Ejecuta `npx prisma db push` localmente

---

### Paso 6: Probar el Login

Una vez que hayas verificado todo:

1. Ve a https://rv-gestion-automotora20.vercel.app/login
2. Selecciona **"Soy Administrador"**
3. Ingresa las credenciales:
   - **Email**: `admin@rvautomoviles.com` (o el que creaste)
   - **Contraseña**: (la que configuraste)
4. Haz clic en **"Iniciar Sesión"**

**Si funciona correctamente:**
- ✅ Deberías ser redirigido a `/dashboard`
- ✅ Deberías ver el dashboard de administrador
- ✅ No debería haber errores en la consola

**Si sigue fallando:**
- Revisa los logs en Vercel (Paso 5)
- Verifica el endpoint `/api/diagnostic` (Paso 1)
- Verifica el endpoint `/api/health` (Paso 2)

---

## 🔍 Verificación Final

Después de seguir todos los pasos, verifica:

- [ ] `/api/diagnostic` muestra todas las variables configuradas
- [ ] `/api/health` muestra `"database": "connected"`
- [ ] Las tablas existen en la base de datos (Usuario, Cliente, Auto, Pago)
- [ ] Existe al menos un usuario admin en la tabla Usuario
- [ ] Los logs en Vercel no muestran errores críticos
- [ ] El login funciona y redirige a `/dashboard`

---

## 🆘 Si Nada Funciona

### Verificar Logs en Tiempo Real

1. Ve a Vercel → Tu proyecto → Deployments
2. Haz clic en el último deployment
3. Haz clic en **"View Function Logs"**
4. Intenta hacer login
5. Observa los logs en tiempo real
6. Busca el error específico

### Verificar Variables de Entorno Manualmente

1. Ve a Vercel → Settings → Environment Variables
2. Verifica que cada variable tenga el valor correcto
3. **IMPORTANTE**: Después de cambiar variables, debes hacer **Redeploy**

### Redeploy Manual

1. Ve a Vercel → Deployments
2. Haz clic en el menú (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Confirma el redeploy
5. Espera 2-3 minutos

---

## 📝 Checklist de Solución

- [ ] Variables de entorno configuradas en Vercel
- [ ] Base de datos conectada (verificado con `/api/health`)
- [ ] Tablas creadas en la base de datos
- [ ] Usuario admin creado en la tabla Usuario
- [ ] Redeploy realizado después de cambios
- [ ] Logs revisados en Vercel
- [ ] Login probado y funcionando

---

**Si después de seguir todos estos pasos el problema persiste, comparte:**
1. El resultado de `/api/diagnostic`
2. El resultado de `/api/health`
3. Los logs de Vercel (especialmente los errores con ❌)
4. Una captura de pantalla del error en la consola del navegador

