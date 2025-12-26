# 🚗 Sistema de Gestión Automotora - DEMO

**Sistema completo de gestión digital para automotoras**

Aplicación web moderna que permite gestionar clientes, vehículos, pagos y reportes de una automotora de forma eficiente y sin papeleos.

---

> **⚠️ VERSIÓN DEMO - SIN BASE DE DATOS EXTERNA**: Esta versión funciona completamente con datos simulados en memoria. No requiere PostgreSQL, MySQL ni ninguna base de datos externa. Perfecta para demos y presentaciones.
>
> **📖 [Guía Rápida de Deploy en Modo Demo →](./DEMO_MODE_README.md)**
>
> Credenciales: `admin@demo.com` / `admin123`

---

## 🚀 Deploy Instantáneo (3 minutos)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mateo14RDGZ/GestionAutomotoraEjemplo)

**Variables de entorno requeridas:**
```
USE_MOCK_DB=true
JWT_SECRET=tu_secret_key_cambiar
NODE_ENV=production
```

[Ver guía detallada de deploy →](./DEMO_MODE_README.md)

---

## ⚡ Quick Start - Deploy en Vercel con Neon

**¿Listo para poner tu app en producción?**

### 📘 Guía Completa de Deploy (Paso a Paso)

👉 **[DEPLOY_VERCEL_NEON.md](DEPLOY_VERCEL_NEON.md)** - Guía completa para deploy en Vercel con base de datos Neon PostgreSQL

Esta guía incluye:
- ✅ Configuración de base de datos en Neon
- ✅ Variables de entorno explicadas
- ✅ Deployment en Vercel
- ✅ Inicialización de base de datos
- ✅ Solución de problemas

### 📝 Guías Adicionales

👉 **[VERCEL_DEPLOY_GUIDE.md](VERCEL_DEPLOY_GUIDE.md)** (si existe)



Incluye:1. **NODE_ENV** = `production`**¿Quieres poner la aplicación en producción AHORA?**

- ✅ Configuración de base de datos en Neon

- ✅ Variables de entorno explicadas2. **POSTGRES_PRISMA_URL** = Tu URL de Neon (con pgbouncer)

- ✅ Deployment en Vercel

- ✅ Inicialización de base de datos3. **DATABASE_URL_UNPOOLED** = Tu URL de Neon (sin pgbouncer)👉 **[Guía Rápida de Deploy](QUICK_DEPLOY.md)** - ¡Lista en 10 minutos!

- ✅ Solución de problemas

4. **JWT_SECRET** = `rv_automoviles_secret_key_2025_super_seguro`

### 📝 Opción 2: Resumen de Cambios

5. **FRONTEND_URL** = `https://tu-dominio.vercel.app`**Documentación de Deploy:**

👉 **[CAMBIOS_RECONSTRUCCION.md](CAMBIOS_RECONSTRUCCION.md)**

6. **VITE_API_URL** = `/api`- 📖 [Guía Completa Paso a Paso](VERCEL_DEPLOY_GUIDE.md)

Para desarrolladores que quieren entender:

- 🔧 Arquitectura serverless implementada- ✅ [Checklist de Deploy](DEPLOY_CHECKLIST.md)

- 📊 Cambios en el código

- 💡 Decisiones técnicas### Deploy:- 📋 [Resumen Ejecutivo](DEPLOY_READY.md)



---```bash- 📝 [Información Post-Deploy](POST_DEPLOY_INFO.md)



## 🎯 Funcionalidadesgit add .



### Autenticacióngit commit -m "Deploy to production"---

- ✅ Login de administrador

- ✅ Login de clientesgit push origin main

- ✅ Gestión de sesiones con JWT

- ✅ Protección de rutas por rol```## �📋 Tabla de Contenidos



### Gestión de Clientes

- ✅ Crear, editar y eliminar clientes

- ✅ Asignar credenciales de accesoVercel desplegará automáticamente.- [Características](#características)

- ✅ Archivar clientes completados

- ✅ Buscar y filtrar- [Tecnologías](#tecnologías)



### Gestión de Autos## 💻 Desarrollo Local- [Requisitos Previos](#requisitos-previos)

- ✅ Inventario de vehículos

- ✅ Estados: Disponible, Vendido, Reservado- [Instalación](#instalación)

- ✅ Asignación a clientes

- ✅ Filtros y búsqueda### Backend:- [Configuración](#configuración)



### Gestión de Pagos```bash- [Ejecución](#ejecución)

- ✅ Generación automática de cuotas

- ✅ Registro de pagoscd backend- [Estructura del Proyecto](#estructura-del-proyecto)

- ✅ Control de vencimientos

- ✅ Histórico de pagosnpm install- [API Endpoints](#api-endpoints)

- ✅ Alertas de pagos vencidos

npx prisma generate- [Uso del Sistema](#uso-del-sistema)

### Dashboard

- ✅ Estadísticas en tiempo realnpm run dev- [Capturas de Pantalla](#capturas-de-pantalla)

- ✅ Indicadores clave (KPIs)

- ✅ Gráficos visuales```- [Solución de Problemas](#solución-de-problemas)

- ✅ Resumen financiero

- [Próximas Funcionalidades](#próximas-funcionalidades)

### Reportes

- ✅ Exportación a PDF### Frontend:

- ✅ Reportes personalizados

- ✅ Listados imprimibles```bash## ✨ Características



---cd frontend



## 🛠️ Stack Tecnológiconpm install### Funcionalidades Principales



### Frontendnpm run dev

- **React** 18.3.1 - UI Library

- **Vite** 5.4.5 - Build Tool```- **Dashboard Interactivo**: Vista general con estadísticas en tiempo real

- **React Router** 6.26.1 - Routing

- **Axios** 1.7.7 - HTTP Client  - Total de autos (disponibles, vendidos, reservados)

- **Tailwind CSS** 3.4.11 - Styling

- **Lucide React** - Icons## 📁 Estructura del Proyecto  - Total de clientes registrados

- **jsPDF** - PDF Generation

  - Resumen de pagos (pagados, pendientes, vencidos)

### Backend

- **Node.js** - Runtime```  - Próximos vencimientos de cuotas

- **Express** 4.19.2 - Web Framework

- **Prisma** 5.19.0 - ORM├── api/              # API serverless para Vercel  - Historial de pagos recientes

- **PostgreSQL** - Database

- **JWT** - Authentication├── backend/          # Servidor Express + Prisma

- **bcryptjs** - Password Hashing

- **Helmet** - Security├── frontend/         # App React con Vite- **Gestión de Autos**

- **CORS** - Cross-Origin

├── vercel.json       # Configuración de Vercel  - Registro completo de vehículos (marca, modelo, año, matrícula, precio)

### Infrastructure

- **Vercel** - Hosting & Serverless Functions└── README.md  - Estados: Disponible, Vendido, Reservado

- **Neon** - PostgreSQL Database

- **GitHub** - Version Control & CI/CD```  - Asignación de clientes



---  - Búsqueda y filtrado avanzado



## 📋 Requisitos## 🔒 Seguridad  - Edición y eliminación



- Node.js 18+ (para desarrollo local)

- Cuenta en Vercel (gratis)

- Cuenta en Neon (gratis)- Autenticación JWT- **Gestión de Clientes**

- Cuenta en GitHub

- Rate limiting  - Registro de información completa (nombre, cédula, teléfono, dirección, email)

---

- CORS configurado  - Visualización de autos asociados

## 🚀 Deployment

- Helmet para headers de seguridad  - Búsqueda rápida

### Opción A: Vercel (Recomendado)

- Variables de entorno protegidas  - Edición y eliminación con validaciones

1. Lee la guía: `VERCEL_DEPLOY_GUIDE.md`

2. Configura Neon PostgreSQL

3. Agrega variables de entorno en Vercel

4. Deploy automático desde GitHub---- **Gestión de Pagos y Cuotas**



### Variables de Entorno Necesarias  - Generación automática de planes de cuotas



```env**Última actualización:** 2025-11-01  - Control de cuotas pagadas y pendientes

NODE_ENV=production

POSTGRES_PRISMA_URL=postgresql://... (de Neon)  - Alertas visuales para pagos vencidos

POSTGRES_URL_NON_POOLING=postgresql://... (de Neon)  - Registro de fechas de vencimiento y pago

JWT_SECRET=tu_clave_secreta_generada  - Marcado rápido de cuotas como pagadas

FRONTEND_URL=https://tu-app.vercel.app  - Filtros: Todas, Pendientes, Vencidas, Pagadas

VITE_API_URL=/api

```- **Autenticación y Seguridad**

  - Sistema de login seguro

---  - Autenticación con JWT

  - Contraseñas encriptadas con bcrypt

## 💻 Desarrollo Local  - Rutas protegidas



### 1. Clonar el repositorio## 🛠️ Tecnologías



```bash### Frontend

git clone https://github.com/Mateo14RDGZ/RV_Gestion_Automotora.git- **React 18** - Framework de interfaz de usuario

cd RV_Gestion_Automotora- **Vite** - Build tool y dev server

```- **TailwindCSS** - Framework de estilos

- **React Router DOM** - Navegación

### 2. Instalar dependencias- **Axios** - Cliente HTTP

- **Lucide React** - Iconos modernos

```bash

# Frontend### Backend

cd frontend- **Node.js** - Runtime de JavaScript

npm install- **Express** - Framework web

- **Prisma** - ORM para base de datos

# Backend- **SQLite** - Base de datos

cd ../backend- **JWT** - Autenticación

npm install- **Bcrypt** - Encriptación de contraseñas



# API (para development)## 📦 Requisitos Previos

cd ../api

npm installAntes de comenzar, asegúrate de tener instalado:

```

- **Node.js** (versión 16 o superior)

### 3. Configurar variables de entorno- **npm** o **yarn**

- **Git** (opcional, para clonar el repositorio)

Crear `.env` en `/backend`:

Verifica las instalaciones:

```env

DATABASE_URL="postgresql://..."```bash

JWT_SECRET="tu_jwt_secret"node --version

NODE_ENV="development"npm --version

FRONTEND_URL="http://localhost:3000"```

```

## 🚀 Instalación

Crear `.env` en `/frontend`:

### Opción 1: Instalación Completa (Recomendada)

```env

VITE_API_URL=http://localhost:5000/apiDesde la raíz del proyecto:

```

```bash

### 4. Inicializar base de datos# Instalar dependencias de frontend y backend

npm run install-all

```bash```

cd backend

npx prisma generate### Opción 2: Instalación Manual

npx prisma db push

npx prisma db seed  # (opcional - datos de prueba)```bash

```# Instalar dependencias del backend

cd backend

### 5. Ejecutar en desarrollonpm install



Terminal 1 - Backend:# Instalar dependencias del frontend

```bashcd ../frontend

cd backendnpm install

npm run dev```

```

## ⚙️ Configuración

Terminal 2 - Frontend:

```bash### 1. Configurar Base de Datos

cd frontend

npm run devEl backend ya incluye un archivo `.env` configurado. Si necesitas modificarlo:

```

```bash

La aplicación estará en:cd backend

- Frontend: http://localhost:3000# Editar .env con tus configuraciones

- Backend API: http://localhost:5000/api```



---Contenido del archivo `.env`:

```env

## 📁 Estructura del ProyectoPORT=5000

JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion

```NODE_ENV=development

RV_Gestion_Automotora/DATABASE_URL="file:../database/automanager.db"

├── api/                    # Funciones serverless para Vercel```

│   ├── index.js           # Handler principal

│   ├── lib/### 2. Inicializar Base de Datos

│   │   ├── prisma.js      # Prisma Client singleton

│   │   └── auth.js        # Middlewares de autenticación```bash

│   ├── prisma/cd backend

│   │   └── schema.prisma  # Schema de base de datos

│   └── package.json# Generar cliente de Prisma

├── backend/               # Código del backend (Express)npx prisma generate

│   ├── routes/           # Rutas de la API

│   │   ├── auth.routes.js# Crear/actualizar la base de datos

│   │   ├── autos.routes.jsnpx prisma db push

│   │   ├── clientes.routes.js

│   │   ├── pagos.routes.js# Poblar con datos de ejemplo

│   │   └── dashboard.routes.jsnpx prisma db seed

│   ├── middleware/       # Middlewares```

│   ├── prisma/          # Configuración de Prisma

│   └── server.js        # Servidor ExpressEsto creará:

├── frontend/            # Aplicación React- 1 usuario administrador

│   ├── src/- 4 clientes de ejemplo

│   │   ├── components/  # Componentes reutilizables- 6 autos de ejemplo

│   │   ├── pages/       # Páginas de la app- 62 cuotas de ejemplo con diferentes estados

│   │   ├── services/    # Servicios (API)

│   │   ├── context/     # Contextos de React### 3. Credenciales por Defecto

│   │   └── utils/       # Utilidades

│   └── dist/           # Build de producción```

├── docs/               # Documentación adicionalEmail: admin@automanager.com

├── VERCEL_DEPLOY_GUIDE.md      # Guía de deployPassword: admin123

├── CAMBIOS_RECONSTRUCCION.md   # Resumen técnico```

├── vercel.json                 # Configuración de Vercel

└── README.md                   # Este archivo## ▶️ Ejecución

```

### Opción 1: Ejecutar Todo Simultáneamente (Recomendada)

---

```bash

## 🔐 Seguridad# Desde la raíz del proyecto

npm run dev

- ✅ Autenticación JWT```

- ✅ Passwords hasheados con bcrypt

- ✅ Validación de entrada con express-validatorEsto iniciará:

- ✅ Rate limiting en rutas sensibles- Backend en `http://localhost:5000`

- ✅ CORS configurado- Frontend en `http://localhost:3000`

- ✅ Helmet para headers seguros

- ✅ HTTPS forzado en producción### Opción 2: Ejecutar por Separado

- ✅ Variables de entorno para credenciales

**Terminal 1 - Backend:**

---```bash

cd backend

## 📊 API Endpointsnpm run dev

```

### Autenticación

- `POST /api/auth/register` - Registrar admin**Terminal 2 - Frontend:**

- `POST /api/auth/login` - Login admin```bash

- `POST /api/auth/login-cliente` - Login clientecd frontend

- `GET /api/auth/verify` - Verificar tokennpm run dev

```

### Clientes

- `GET /api/clientes` - Listar### Acceder a la Aplicación

- `GET /api/clientes/:id` - Obtener uno

- `POST /api/clientes` - CrearAbre tu navegador en: **http://localhost:3000**

- `PUT /api/clientes/:id` - Actualizar

- `DELETE /api/clientes/:id` - Eliminar## 📁 Estructura del Proyecto



### Autos```

- `GET /api/autos` - ListarAdministracion_RV_Automoviles/

- `GET /api/autos/:id` - Obtener uno├── backend/

- `POST /api/autos` - Crear│   ├── middleware/

- `PUT /api/autos/:id` - Actualizar│   │   └── auth.middleware.js       # Middleware de autenticación JWT

- `DELETE /api/autos/:id` - Eliminar│   ├── routes/

│   │   ├── auth.routes.js           # Rutas de autenticación

### Pagos│   │   ├── autos.routes.js          # Rutas de autos

- `GET /api/pagos` - Listar│   │   ├── clientes.routes.js       # Rutas de clientes

- `GET /api/pagos/proximos-vencimientos` - Próximos vencimientos│   │   ├── pagos.routes.js          # Rutas de pagos

- `POST /api/pagos` - Crear pago│   │   └── dashboard.routes.js      # Rutas del dashboard

- `POST /api/pagos/generar-cuotas` - Generar cuotas│   ├── prisma/

- `PUT /api/pagos/:id` - Actualizar pago│   │   ├── schema.prisma            # Esquema de base de datos

- `DELETE /api/pagos/:id` - Eliminar pago│   │   └── seed.js                  # Datos de ejemplo

│   ├── .env                         # Variables de entorno

### Dashboard│   ├── server.js                    # Servidor Express

- `GET /api/dashboard/stats` - Estadísticas│   └── package.json

│

---├── frontend/

│   ├── src/

## 🧪 Testing│   │   ├── components/

│   │   │   ├── Layout.jsx           # Layout principal con sidebar

```bash│   │   │   └── PrivateRoute.jsx     # Protección de rutas

# Backend│   │   ├── context/

cd backend│   │   │   └── AuthContext.jsx      # Contexto de autenticación

npm test│   │   ├── pages/

│   │   │   ├── Login.jsx            # Página de login

# Frontend│   │   │   ├── Dashboard.jsx        # Dashboard principal

cd frontend│   │   │   ├── Autos.jsx            # Gestión de autos

npm test│   │   │   ├── Clientes.jsx         # Gestión de clientes

```│   │   │   └── Pagos.jsx            # Gestión de pagos

│   │   ├── services/

---│   │   │   ├── api.js               # Configuración de Axios

│   │   │   └── index.js             # Servicios de API

## 📝 Licencia│   │   ├── App.jsx                  # Componente raíz

│   │   ├── main.jsx                 # Punto de entrada

Este proyecto es de uso privado para RV Automóviles.│   │   └── index.css                # Estilos globales

│   ├── index.html

---│   ├── vite.config.js

│   ├── tailwind.config.js

## 👤 Autor│   └── package.json

│

**Mateo Rodriguez**├── database/

- GitHub: [@Mateo14RDGZ](https://github.com/Mateo14RDGZ)│   ├── automanager.db               # Base de datos SQLite (generada)

│   └── README.md

---│

├── docs/

## 🆘 Soporte│   └── ...                          # Documentación adicional

│

¿Problemas con el deployment?├── .gitignore

├── package.json                     # Scripts principales

1. Lee `VERCEL_DEPLOY_GUIDE.md` - sección "Solución de Problemas"└── README.md                        # Este archivo

2. Revisa los logs en Vercel Dashboard```

3. Verifica las variables de entorno

4. Abre un issue en GitHub## 🔌 API Endpoints



---### Autenticación (`/api/auth`)

```

**¡Happy coding! 🚀**POST   /api/auth/register        # Registrar nuevo usuario

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

