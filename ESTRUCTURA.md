# 📂 Estructura del Proyecto

Descripción detallada de la organización de carpetas y archivos.

## 🗂️ Árbol de Directorios

```
rifa-altruista/
│
├── 📁 app/                          # Next.js 14 App Router
│   ├── 📁 api/                      # API Routes (Backend)
│   │   ├── 📁 auth/                 # Endpoints de autenticación
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts         # NextAuth handler
│   │   │   ├── register/
│   │   │   │   └── route.ts         # POST: Registrar usuario
│   │   │   ├── verify/
│   │   │   │   └── route.ts         # GET: Verificar email
│   │   │   ├── forgot-password/
│   │   │   │   └── route.ts         # POST: Solicitar reset
│   │   │   └── reset-password/
│   │   │       └── route.ts         # POST: Restablecer contraseña
│   │   │
│   │   ├── 📁 tickets/              # Endpoints de boletos
│   │   │   ├── route.ts             # GET: Obtener todos los boletos
│   │   │   └── reserve/
│   │   │       └── route.ts         # POST: Reservar boletos
│   │   │
│   │   ├── 📁 transfers/            # Endpoints de transferencias
│   │   │   └── upload/
│   │   │       └── route.ts         # POST: Subir comprobante
│   │   │
│   │   ├── 📁 admin/                # Endpoints de administrador
│   │   │   ├── stats/
│   │   │   │   └── route.ts         # GET: Estadísticas generales
│   │   │   ├── transfers/
│   │   │   │   ├── route.ts         # GET: Transferencias pendientes
│   │   │   │   └── validate/
│   │   │   │       └── route.ts     # POST: Aprobar/rechazar
│   │   │   └── tickets/
│   │   │       └── physical/
│   │   │           └── route.ts     # POST: Registrar venta física
│   │   │
│   │   └── 📁 user/                 # Endpoints de usuario
│   │       └── purchases/
│   │           └── route.ts         # GET: Compras del usuario
│   │
│   ├── 📁 auth/                     # Páginas de autenticación
│   │   ├── login/
│   │   │   └── page.tsx             # Iniciar sesión
│   │   ├── register/
│   │   │   └── page.tsx             # Registro
│   │   ├── verify/
│   │   │   └── page.tsx             # Verificar email (con token)
│   │   ├── verify-email/
│   │   │   └── page.tsx             # Mensaje "revisa tu email"
│   │   ├── forgot-password/
│   │   │   └── page.tsx             # Solicitar reset
│   │   ├── reset-password/
│   │   │   └── page.tsx             # Nueva contraseña (con token)
│   │   └── error/
│   │       └── page.tsx             # Errores de autenticación
│   │
│   ├── 📁 dashboard/                # Dashboard de usuario
│   │   └── page.tsx                 # Panel personal
│   │
│   ├── 📁 comprar/                  # Página de compra
│   │   └── page.tsx                 # Selección y pago
│   │
│   ├── 📁 admin/                    # Panel de administración
│   │   ├── page.tsx                 # Dashboard principal
│   │   ├── transfers/
│   │   │   └── page.tsx             # Validar transferencias
│   │   └── physical-sales/
│   │       └── page.tsx             # Ventas físicas
│   │
│   ├── layout.tsx                   # Layout raíz
│   ├── page.tsx                     # Landing page
│   ├── globals.css                  # Estilos globales
│   └── providers.tsx                # Providers (NextAuth)
│
├── 📁 components/                   # Componentes React reutilizables
│   ├── Navbar.tsx                   # Barra de navegación
│   ├── Countdown.tsx                # Contador regresivo
│   └── TicketGrid.tsx               # Grid de 500 boletos
│
├── 📁 lib/                          # Librerías y utilidades
│   ├── prisma.ts                    # Cliente de Prisma
│   ├── auth.ts                      # Configuración de NextAuth
│   ├── email.ts                     # Sistema de emails (Nodemailer)
│   └── utils.ts                     # Funciones auxiliares
│
├── 📁 prisma/                       # Configuración de Prisma ORM
│   ├── schema.prisma                # Esquema de base de datos
│   ├── seed.ts                      # Datos iniciales
│   └── migrations/                  # Historial de migraciones (gitignored)
│
├── 📁 scripts/                      # Scripts de utilidad
│   └── create-admin.js              # Crear administrador adicional
│
├── 📁 types/                        # Tipos TypeScript
│   └── next-auth.d.ts               # Extensiones de tipos para NextAuth
│
├── 📁 public/                       # Archivos estáticos
│   └── 📁 uploads/                  # Comprobantes subidos (gitignored)
│
├── 📄 .env                          # Variables de entorno (gitignored)
├── 📄 .env.example                  # Ejemplo de variables
├── 📄 .gitignore                    # Archivos ignorados por Git
├── 📄 .cursorignore                 # Archivos ignorados por Cursor
├── 📄 middleware.ts                 # Middleware de Next.js
├── 📄 next.config.js                # Configuración de Next.js
├── 📄 postcss.config.js             # Configuración de PostCSS
├── 📄 tailwind.config.ts            # Configuración de Tailwind
├── 📄 tsconfig.json                 # Configuración de TypeScript
├── 📄 package.json                  # Dependencias y scripts
│
├── 📄 README.md                     # Documentación principal
├── 📄 INSTALACION.md                # Guía de instalación
├── 📄 MANUAL_DE_USO.md              # Manual para usuarios y admins
├── 📄 FLUJO_DEL_SISTEMA.md          # Documentación técnica de flujos
└── 📄 ESTRUCTURA.md                 # Este archivo
```

## 📋 Descripción de Carpetas Principales

### `/app` - Aplicación Next.js

Contiene toda la aplicación usando el App Router de Next.js 14.

- **`/api`**: Todos los endpoints del backend (API Routes)
- **`/auth`**: Páginas relacionadas con autenticación
- **`/dashboard`**: Panel personal del usuario
- **`/comprar`**: Proceso de compra de boletos
- **`/admin`**: Panel de administración

### `/components` - Componentes React

Componentes reutilizables que se usan en múltiples páginas:

- **`Navbar.tsx`**: Barra de navegación con menús dinámicos según rol
- **`Countdown.tsx`**: Contador regresivo al sorteo
- **`TicketGrid.tsx`**: Grid interactivo de 500 boletos con estados

### `/lib` - Librerías y Utilidades

Código compartido y configuraciones:

- **`prisma.ts`**: Instancia singleton del cliente de Prisma
- **`auth.ts`**: Configuración de NextAuth (providers, callbacks)
- **`email.ts`**: Sistema de emails con plantillas HTML
- **`utils.ts`**: Funciones auxiliares (formateo, validación, limpieza)

### `/prisma` - Base de Datos

- **`schema.prisma`**: Define el esquema completo de la BD
  - Modelos: User, Ticket, Purchase, Transfer, AdminLog, RaffleConfig
  - Relaciones, índices, enums
- **`seed.ts`**: Script para datos iniciales (admin + 500 boletos)

### `/scripts` - Scripts de Utilidad

Scripts Node.js para tareas administrativas:

- **`create-admin.js`**: Crear administradores adicionales

## 📄 Archivos de Configuración

| Archivo | Propósito |
|---------|-----------|
| `next.config.js` | Configuración de Next.js |
| `tailwind.config.ts` | Colores, estilos, temas |
| `tsconfig.json` | Opciones del compilador TypeScript |
| `postcss.config.js` | Procesamiento de CSS |
| `middleware.ts` | Protección de rutas (auth) |
| `.env` | Variables de entorno (NO commitear) |
| `.gitignore` | Archivos a ignorar en Git |
| `package.json` | Dependencias y scripts npm |
| `prisma/schema.prisma` | Esquema de base de datos |

## 🔗 Rutas de la Aplicación

### Rutas Públicas (no requieren autenticación)

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page principal |
| `/auth/login` | Iniciar sesión |
| `/auth/register` | Registrarse |
| `/auth/verify?token=...` | Verificar email |
| `/auth/forgot-password` | Recuperar contraseña |
| `/auth/reset-password?token=...` | Restablecer contraseña |

### Rutas Protegidas (requieren autenticación)

| Ruta | Descripción | Rol Requerido |
|------|-------------|---------------|
| `/dashboard` | Panel personal | USER |
| `/comprar` | Comprar boletos | USER |
| `/admin` | Dashboard admin | ADMIN |
| `/admin/transfers` | Validar transferencias | ADMIN |
| `/admin/physical-sales` | Ventas físicas | ADMIN |

### API Endpoints

#### Públicos

```
POST   /api/auth/register          # Registrar usuario
GET    /api/auth/verify            # Verificar email
POST   /api/auth/forgot-password   # Solicitar reset
POST   /api/auth/reset-password    # Restablecer contraseña
GET    /api/tickets                # Ver todos los boletos
```

#### Autenticados (USER)

```
POST   /api/tickets/reserve        # Reservar boletos
POST   /api/transfers/upload       # Subir comprobante
GET    /api/user/purchases         # Ver mis compras
```

#### Autenticados (ADMIN)

```
GET    /api/admin/stats                    # Estadísticas
GET    /api/admin/transfers                # Transferencias pendientes
POST   /api/admin/transfers/validate       # Aprobar/rechazar
POST   /api/admin/tickets/physical         # Venta física
```

## 🗃️ Estructura de Base de Datos

### Tablas Principales

| Tabla | Descripción | Relaciones |
|-------|-------------|------------|
| `User` | Usuarios del sistema | → Ticket, Purchase, AdminLog |
| `Ticket` | Los 500 boletos | ← User, Purchase |
| `Purchase` | Compras realizadas | ← User, → Ticket, Transfer |
| `Transfer` | Transferencias bancarias | ← Purchase |
| `AdminLog` | Auditoría de acciones | ← User (admin) |
| `RaffleConfig` | Configuración global | - |

Ver `prisma/schema.prisma` para detalles completos.

## 🎨 Sistema de Estilos

### Tailwind CSS

Usamos Tailwind con configuración personalizada:

**Colores principales:**
- `primary`: Azul (botones principales, links)
- `success`: Verde (boletos disponibles, aprobaciones)
- `warning`: Amarillo (pendientes, alertas)
- `danger`: Rojo (errores, rechazos)

**Componentes:**
- Cards con `rounded-xl shadow-lg`
- Botones con hover states
- Gradientes para headers
- Responsive por defecto

### CSS Global

`app/globals.css`:
- Reset de Tailwind
- Animaciones custom (`animate-fade-in`)
- Scrollbar personalizado
- Variables CSS para dark mode (preparado)

## 🔄 Flujo de Datos

### Usuario compra boletos

```
Cliente (Browser)
    ↓ [POST /api/tickets/reserve]
API Route (Next.js)
    ↓ [Prisma]
PostgreSQL
    ↓ [Return]
API Route
    ↓ [JSON Response]
Cliente
```

### Subida de comprobante

```
Cliente (Browser)
    ↓ [POST /api/transfers/upload + FormData]
API Route
    ↓ [writeFile]
/public/uploads/
    ↓ [Prisma]
PostgreSQL
    ↓ [Nodemailer]
Email SMTP
```

### Validación de admin

```
Admin (Browser)
    ↓ [POST /api/admin/transfers/validate]
API Route
    ↓ [Prisma Transaction]
PostgreSQL (Update Ticket, Purchase, Transfer)
    ↓ [Nodemailer]
Email a Usuario
    ↓ [AdminLog]
PostgreSQL (Auditoría)
```

## 📦 Dependencias Clave

### Producción

- **next**: Framework React
- **react**: Librería UI
- **@prisma/client**: ORM
- **next-auth**: Autenticación
- **bcryptjs**: Hash de contraseñas
- **nodemailer**: Emails
- **react-hot-toast**: Notificaciones
- **xlsx**: Importar Excel (futuro)
- **zustand**: State management (opcional)

### Desarrollo

- **prisma**: CLI de Prisma
- **typescript**: Tipos estáticos
- **tailwindcss**: Estilos
- **ts-node**: Ejecutar TypeScript

## 🔐 Seguridad

### Archivos Sensibles (NO commitear)

- `.env` - Variables de entorno
- `/public/uploads/*` - Comprobantes de usuarios
- `prisma/migrations/` - Historial de BD
- `node_modules/` - Dependencias

Todos están en `.gitignore`

### Protecciones Implementadas

- Contraseñas hasheadas (bcrypt)
- Tokens únicos para verificación
- Middleware de autenticación
- Validación de roles (USER/ADMIN)
- Sanitización de inputs
- Hash de archivos (anti-duplicados)

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo (localhost:3000)

# Producción
npm run build            # Compilar para producción
npm run start            # Servidor de producción

# Base de datos
npx prisma migrate dev   # Crear migración
npx prisma generate      # Generar cliente
npx prisma db seed       # Ejecutar seed
npx prisma studio        # UI visual de BD

# Utilidades
npm run lint             # Linter
node scripts/create-admin.js  # Crear admin
```

## 📊 Métricas del Proyecto

Aproximadamente:

- **50+ archivos** de código
- **3,000+ líneas** de TypeScript/TSX
- **7 tablas** en la base de datos
- **20+ endpoints** de API
- **15+ páginas** públicas y privadas
- **10+ emails** con plantillas

## 🔮 Futuras Extensiones

Áreas donde se puede expandir:

- `/app/admin/reports/` - Reportes y gráficas
- `/app/admin/users/` - Gestión de usuarios
- `/app/admin/config/` - Configuración de la rifa
- `/components/charts/` - Componentes de gráficas
- `/lib/payment/` - Integración con pasarelas
- `/lib/excel/` - Importar/exportar Excel
- `cron/` - Tareas programadas

## 📚 Archivos de Documentación

| Archivo | Para quién | Contenido |
|---------|------------|-----------|
| `README.md` | Desarrolladores | Visión general, instalación, deployment |
| `INSTALACION.md` | Nuevos devs | Guía paso a paso de instalación |
| `MANUAL_DE_USO.md` | Usuarios y admins | Cómo usar el sistema |
| `FLUJO_DEL_SISTEMA.md` | Desarrolladores | Estados, reglas, flujos técnicos |
| `ESTRUCTURA.md` | Este archivo | Organización del proyecto |

---

Esta estructura está diseñada para ser escalable y mantenible. Cada carpeta tiene un propósito claro y las responsabilidades están bien separadas.


