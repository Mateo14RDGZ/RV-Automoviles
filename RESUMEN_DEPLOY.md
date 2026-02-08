# 🚀 Resumen para Deploy en Vercel

## ✅ Estado del Proyecto

- ✅ Logos y referencias de "Nicolas Tejera Automoviles" eliminados
- ✅ Código limpio y listo para producción
- ✅ Configuración de Vercel lista (`vercel.json`)
- ✅ Documentación de variables de entorno creada

## 📦 Repositorio

**URL**: https://github.com/Mateo14RDGZ/RV-Automoviles

## 🔐 Variables de Entorno Requeridas en Vercel

### Variables Obligatorias:

```env
NODE_ENV=production

POSTGRES_PRISMA_URL=postgresql://usuario:password@host.neon.tech/database?sslmode=require&pgbouncer=true

DATABASE_URL=postgresql://usuario:password@host.neon.tech/database?sslmode=require

JWT_SECRET=tu_clave_secreta_super_segura_minimo_32_caracteres_2025

FRONTEND_URL=https://tu-app.vercel.app

VITE_API_URL=/api
```

### Variables Opcionales (para emails):

```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_gmail
```

## 📝 Pasos para Deploy

### 1. Crear Repositorio en GitHub (si no existe)
- Ve a https://github.com/new
- Nombre: `RV-Automoviles`
- Crea el repositorio (sin inicializar)

### 2. Subir Código
```bash
cd QuesadaAutomoviles
git remote set-url origin https://github.com/Mateo14RDGZ/RV-Automoviles.git
git push -u origin main
```

### 3. Conectar con Vercel
1. Ve a https://vercel.com/new
2. Importa el repositorio `RV-Automoviles`
3. Vercel detectará automáticamente la configuración

### 4. Configurar Variables de Entorno
1. En Vercel Dashboard > Settings > Environment Variables
2. Agrega todas las variables listadas arriba
3. **Importante**: 
   - `POSTGRES_PRISMA_URL` debe tener `pgbouncer=true`
   - `DATABASE_URL` NO debe tener `pgbouncer=true`
   - `FRONTEND_URL` debe ser la URL que Vercel te asigne después del primer deploy

### 5. Configurar Base de Datos Neon
1. Crea una cuenta en https://neon.tech
2. Crea un nuevo proyecto
3. Copia las URLs de conexión:
   - **Pooled connection** → `POSTGRES_PRISMA_URL`
   - **Direct connection** → `DATABASE_URL`

### 6. Inicializar Base de Datos
Después del primer deploy, ejecuta las migraciones:

```bash
# Opción 1: Desde Vercel CLI
vercel env pull
cd api
npx prisma migrate deploy

# Opción 2: Desde tu máquina local
# Configura las variables de entorno localmente
cd api
npx prisma migrate deploy
```

### 7. Seed de Datos (Opcional)
```bash
cd api
npx prisma db seed
```

## 📄 Documentación Completa

Para más detalles, consulta:
- **VARIABLES_ENTORNO_VERCEL.md** - Guía completa de variables de entorno
- **README.md** - Documentación general del proyecto

## ⚠️ Notas Importantes

1. **JWT_SECRET**: Genera una clave segura única (mínimo 32 caracteres)
2. **FRONTEND_URL**: Actualiza esta variable después del primer deploy con la URL real de Vercel
3. **Base de Datos**: Asegúrate de que Neon esté configurado antes del deploy
4. **Migraciones**: Ejecuta las migraciones después del primer deploy exitoso

## 🆘 Solución de Problemas

### Error: "Repository not found"
- Verifica que el repositorio exista en GitHub
- Verifica que tengas permisos de escritura

### Error: "Database URL not configured"
- Verifica que `POSTGRES_PRISMA_URL` esté configurada en Vercel
- Verifica que la URL sea válida y accesible

### Error: "CORS policy"
- Verifica que `FRONTEND_URL` coincida exactamente con tu dominio en Vercel
- Incluye el protocolo `https://`

---

**Última actualización**: 2025-01-XX
