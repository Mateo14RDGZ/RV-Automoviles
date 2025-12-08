# 🚀 CONFIGURACIÓN DE BASE DE DATOS

## ⚠️ IMPORTANTE: Los datos no se están guardando porque falta configurar la base de datos

Tu aplicación necesita conectarse a una base de datos PostgreSQL en Neon para que los datos se guarden permanentemente.

---

## 📋 Pasos para Configurar la Base de Datos

### 1️⃣ Crear cuenta en Neon (GRATIS)

1. Ve a **https://neon.tech**
2. Haz clic en **"Sign Up"** 
3. Regístrate con GitHub, Google o Email

### 2️⃣ Crear tu proyecto

1. Haz clic en **"Create Project"**
2. Dale un nombre: `RV_Automoviles`
3. Selecciona la región más cercana a ti
4. Haz clic en **"Create Project"**

### 3️⃣ Copiar tu Connection String

Después de crear el proyecto verás algo como:

```
postgresql://usuario123:abc456xyz@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**¡COPIA ESA LÍNEA COMPLETA!**

### 4️⃣ Configurar tu aplicación

1. Abre el archivo **`.env`** (en la raíz del proyecto)
2. Busca la línea que dice `DATABASE_URL=`
3. Reemplázala con tu Connection String de Neon:

```env
DATABASE_URL=postgresql://tu_usuario:tu_password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

4. **Guarda el archivo** (Ctrl + S)

### 5️⃣ Configurar las tablas

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
npm run db:setup
```

Esto creará todas las tablas necesarias en tu base de datos.

### 6️⃣ Verificar la conexión (opcional)

```powershell
npm run db:check
```

Este comando verificará que todo esté configurado correctamente.

### 7️⃣ Agregar datos iniciales (opcional)

Si quieres agregar usuarios y datos de ejemplo:

```powershell
npm run db:seed
```

---

## ✅ ¡Listo!

Ahora cuando agregues autos o clientes, **se guardarán permanentemente** en tu base de datos PostgreSQL en la nube.

---

## 🆘 ¿Problemas?

### Error: "DATABASE_URL no está configurada"
- Asegúrate de tener un archivo `.env` en la raíz del proyecto
- Verifica que la línea `DATABASE_URL` esté configurada correctamente

### Error: "Cannot connect to database"
- Verifica tu conexión a internet
- Asegúrate de copiar la Connection String completa de Neon
- Verifica que tu proyecto en Neon esté activo

### ¿Dónde está el archivo .env?
- Está en la raíz del proyecto: `RV-Gestion-Automotora/.env`
- Si no existe, usa el archivo `.env.example` como plantilla

---

## 📚 Documentación Adicional

- [Guía completa de Neon](docs/NEON_SETUP.md)
- [Documentación de la API](docs/API.md)

