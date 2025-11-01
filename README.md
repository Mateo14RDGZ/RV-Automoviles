# 🚗 RV Automóviles - Sistema de Gestión# 🚗 RV Automoviles



Sistema completo de gestión para RV Automóviles con frontend React y backend Express + PostgreSQL.**Sistema de Gestión Digital para Automotoras**



## 🚀 Deploy en Producción (Vercel)RV Automoviles es una aplicación web completa diseñada para digitalizar y automatizar la gestión de una automotora, eliminando el uso de papel y centralizando toda la información en un sistema moderno y eficiente.



### Variables de Entorno Requeridas en Vercel:## � Deploy Rápido en Vercel



1. **NODE_ENV** = `production`**¿Quieres poner la aplicación en producción AHORA?**

2. **POSTGRES_PRISMA_URL** = Tu URL de Neon (con pgbouncer)

3. **DATABASE_URL_UNPOOLED** = Tu URL de Neon (sin pgbouncer)👉 **[Guía Rápida de Deploy](QUICK_DEPLOY.md)** - ¡Lista en 10 minutos!

4. **JWT_SECRET** = `rv_automoviles_secret_key_2025_super_seguro`

5. **FRONTEND_URL** = `https://tu-dominio.vercel.app`**Documentación de Deploy:**

6. **VITE_API_URL** = `/api`- 📖 [Guía Completa Paso a Paso](VERCEL_DEPLOY_GUIDE.md)

- ✅ [Checklist de Deploy](DEPLOY_CHECKLIST.md)

### Deploy:- 📋 [Resumen Ejecutivo](DEPLOY_READY.md)

```bash- 📝 [Información Post-Deploy](POST_DEPLOY_INFO.md)

git add .

git commit -m "Deploy to production"---

git push origin main

```## �📋 Tabla de Contenidos



Vercel desplegará automáticamente.- [Características](#características)

- [Tecnologías](#tecnologías)

## 💻 Desarrollo Local- [Requisitos Previos](#requisitos-previos)

- [Instalación](#instalación)

### Backend:- [Configuración](#configuración)

```bash- [Ejecución](#ejecución)

cd backend- [Estructura del Proyecto](#estructura-del-proyecto)

npm install- [API Endpoints](#api-endpoints)

npx prisma generate- [Uso del Sistema](#uso-del-sistema)

npm run dev- [Capturas de Pantalla](#capturas-de-pantalla)

```- [Solución de Problemas](#solución-de-problemas)

- [Próximas Funcionalidades](#próximas-funcionalidades)

### Frontend:

```bash## ✨ Características

cd frontend

npm install### Funcionalidades Principales

npm run dev

```- **Dashboard Interactivo**: Vista general con estadísticas en tiempo real

  - Total de autos (disponibles, vendidos, reservados)

## 📁 Estructura del Proyecto  - Total de clientes registrados

  - Resumen de pagos (pagados, pendientes, vencidos)

```  - Próximos vencimientos de cuotas

├── api/              # API serverless para Vercel  - Historial de pagos recientes

├── backend/          # Servidor Express + Prisma

├── frontend/         # App React con Vite- **Gestión de Autos**

├── vercel.json       # Configuración de Vercel  - Registro completo de vehículos (marca, modelo, año, matrícula, precio)

└── README.md  - Estados: Disponible, Vendido, Reservado

```  - Asignación de clientes

  - Búsqueda y filtrado avanzado

## 🔒 Seguridad  - Edición y eliminación



- Autenticación JWT- **Gestión de Clientes**

- Rate limiting  - Registro de información completa (nombre, cédula, teléfono, dirección, email)

- CORS configurado  - Visualización de autos asociados

- Helmet para headers de seguridad  - Búsqueda rápida

- Variables de entorno protegidas  - Edición y eliminación con validaciones



---- **Gestión de Pagos y Cuotas**

  - Generación automática de planes de cuotas

**Última actualización:** 2025-11-01  - Control de cuotas pagadas y pendientes

  - Alertas visuales para pagos vencidos
  - Registro de fechas de vencimiento y pago
  - Marcado rápido de cuotas como pagadas
  - Filtros: Todas, Pendientes, Vencidas, Pagadas

- **Autenticación y Seguridad**
  - Sistema de login seguro
  - Autenticación con JWT
  - Contraseñas encriptadas con bcrypt
  - Rutas protegidas

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework de interfaz de usuario
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework de estilos
- **React Router DOM** - Navegación
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos modernos

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Prisma** - ORM para base de datos
- **SQLite** - Base de datos
- **JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior)
- **npm** o **yarn**
- **Git** (opcional, para clonar el repositorio)

Verifica las instalaciones:

```bash
node --version
npm --version
```

## 🚀 Instalación

### Opción 1: Instalación Completa (Recomendada)

Desde la raíz del proyecto:

```bash
# Instalar dependencias de frontend y backend
npm run install-all
```

### Opción 2: Instalación Manual

```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

## ⚙️ Configuración

### 1. Configurar Base de Datos

El backend ya incluye un archivo `.env` configurado. Si necesitas modificarlo:

```bash
cd backend
# Editar .env con tus configuraciones
```

Contenido del archivo `.env`:
```env
PORT=5000
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion
NODE_ENV=development
DATABASE_URL="file:../database/automanager.db"
```

### 2. Inicializar Base de Datos

```bash
cd backend

# Generar cliente de Prisma
npx prisma generate

# Crear/actualizar la base de datos
npx prisma db push

# Poblar con datos de ejemplo
npx prisma db seed
```

Esto creará:
- 1 usuario administrador
- 4 clientes de ejemplo
- 6 autos de ejemplo
- 62 cuotas de ejemplo con diferentes estados

### 3. Credenciales por Defecto

```
Email: admin@automanager.com
Password: admin123
```

## ▶️ Ejecución

### Opción 1: Ejecutar Todo Simultáneamente (Recomendada)

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto iniciará:
- Backend en `http://localhost:5000`
- Frontend en `http://localhost:3000`

### Opción 2: Ejecutar por Separado

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Acceder a la Aplicación

Abre tu navegador en: **http://localhost:3000**

## 📁 Estructura del Proyecto

```
Administracion_RV_Automoviles/
├── backend/
│   ├── middleware/
│   │   └── auth.middleware.js       # Middleware de autenticación JWT
│   ├── routes/
│   │   ├── auth.routes.js           # Rutas de autenticación
│   │   ├── autos.routes.js          # Rutas de autos
│   │   ├── clientes.routes.js       # Rutas de clientes
│   │   ├── pagos.routes.js          # Rutas de pagos
│   │   └── dashboard.routes.js      # Rutas del dashboard
│   ├── prisma/
│   │   ├── schema.prisma            # Esquema de base de datos
│   │   └── seed.js                  # Datos de ejemplo
│   ├── .env                         # Variables de entorno
│   ├── server.js                    # Servidor Express
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx           # Layout principal con sidebar
│   │   │   └── PrivateRoute.jsx     # Protección de rutas
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Contexto de autenticación
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Página de login
│   │   │   ├── Dashboard.jsx        # Dashboard principal
│   │   │   ├── Autos.jsx            # Gestión de autos
│   │   │   ├── Clientes.jsx         # Gestión de clientes
│   │   │   └── Pagos.jsx            # Gestión de pagos
│   │   ├── services/
│   │   │   ├── api.js               # Configuración de Axios
│   │   │   └── index.js             # Servicios de API
│   │   ├── App.jsx                  # Componente raíz
│   │   ├── main.jsx                 # Punto de entrada
│   │   └── index.css                # Estilos globales
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── database/
│   ├── automanager.db               # Base de datos SQLite (generada)
│   └── README.md
│
├── docs/
│   └── ...                          # Documentación adicional
│
├── .gitignore
├── package.json                     # Scripts principales
└── README.md                        # Este archivo
```

## 🔌 API Endpoints

### Autenticación (`/api/auth`)
```
POST   /api/auth/register        # Registrar nuevo usuario
POST   /api/auth/login           # Iniciar sesión
GET    /api/auth/verify          # Verificar token
```

### Autos (`/api/autos`)
```
GET    /api/autos                # Obtener todos los autos
GET    /api/autos/:id            # Obtener un auto por ID
POST   /api/autos                # Crear nuevo auto
PUT    /api/autos/:id            # Actualizar auto
DELETE /api/autos/:id            # Eliminar auto
```

### Clientes (`/api/clientes`)
```
GET    /api/clientes             # Obtener todos los clientes
GET    /api/clientes/:id         # Obtener un cliente por ID
POST   /api/clientes             # Crear nuevo cliente
PUT    /api/clientes/:id         # Actualizar cliente
DELETE /api/clientes/:id         # Eliminar cliente
```

### Pagos (`/api/pagos`)
```
GET    /api/pagos                      # Obtener todos los pagos
GET    /api/pagos/proximos-vencimientos # Obtener próximos vencimientos
POST   /api/pagos                      # Crear nueva cuota
POST   /api/pagos/generar-cuotas      # Generar plan de cuotas
PUT    /api/pagos/:id                 # Actualizar pago
DELETE /api/pagos/:id                 # Eliminar pago
```

### Dashboard (`/api/dashboard`)
```
GET    /api/dashboard/stats      # Obtener estadísticas generales
```

## 📖 Uso del Sistema

### 1. Inicio de Sesión
1. Abre la aplicación en `http://localhost:3000`
2. Usa las credenciales: `admin@automanager.com` / `admin123`
3. Serás redirigido al Dashboard

### 2. Registrar un Cliente
1. Ve a **Clientes** en el menú lateral
2. Haz clic en **Nuevo Cliente**
3. Completa el formulario con los datos
4. Guarda el cliente

### 3. Registrar un Auto
1. Ve a **Autos** en el menú
2. Haz clic en **Nuevo Auto**
3. Completa los datos del vehículo
4. Asigna un cliente (opcional)
5. Selecciona el estado (disponible, vendido, reservado)

### 4. Generar Plan de Cuotas
1. Ve a **Pagos**
2. Haz clic en **Generar Cuotas**
3. Selecciona el auto
4. Define:
   - Número de cuotas
   - Monto por cuota
   - Fecha de inicio
   - Intervalo (usualmente 1 mes)
5. El sistema generará todas las cuotas automáticamente

### 5. Marcar Cuotas como Pagadas
1. En la sección **Pagos**, busca la cuota
2. Haz clic en **Marcar Pagado**
3. La cuota se actualizará con la fecha de pago

### 6. Ver Resumen en Dashboard
El Dashboard muestra automáticamente:
- Estadísticas generales
- Cuotas próximas a vencer (7 días)
- Cuotas vencidas (en rojo)
- Últimos pagos recibidos

## 🎨 Capturas de Pantalla

*(Aquí puedes agregar capturas de pantalla una vez que ejecutes la aplicación)*

## ❗ Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
cd backend && npm install
cd ../frontend && npm install
```

### Error: Base de datos no inicializada
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### Puerto en uso
Si el puerto 3000 o 5000 está en uso:

**Backend:**
Edita `backend/.env` y cambia `PORT=5000` a otro puerto

**Frontend:**
Edita `frontend/vite.config.js` y cambia el puerto

### Error de autenticación
Verifica que:
1. El backend esté corriendo
2. El archivo `.env` tenga `JWT_SECRET` configurado
3. Estés usando las credenciales correctas

## 🔮 Próximas Funcionalidades

- [ ] **Reportes y Exportación**
  - Generar reportes en PDF
  - Exportar a Excel
  - Reportes de ventas mensuales

- [ ] **Filtros Avanzados**
  - Filtrar por rango de fechas
  - Filtrar por rangos de precios
  - Búsqueda múltiple

- [ ] **Notificaciones**
  - Alertas por email de pagos vencidos
  - Recordatorios automáticos

- [ ] **Mejoras de UI**
  - Gráficos de estadísticas
  - Vista de calendario de pagos
  - Modo oscuro

- [ ] **Funcionalidades Extra**
  - Historial de cambios
  - Auditoría de acciones
  - Backup automático
  - Múltiples usuarios con roles

## 👨‍💻 Desarrollo

### Visualizar Base de Datos

```bash
cd backend
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555` para ver y editar la base de datos.

### Agregar Nuevos Modelos

1. Edita `backend/prisma/schema.prisma`
2. Ejecuta:
```bash
npx prisma generate
npx prisma db push
```

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia ISC.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la sección de [Solución de Problemas](#solución-de-problemas)
2. Verifica que todas las dependencias estén instaladas correctamente
3. Asegúrate de que los puertos no estén en uso

---

**¡Desarrollado con ❤️ para digitalizar y modernizar tu automotora!**
