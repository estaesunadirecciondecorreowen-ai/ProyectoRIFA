# 🎫 Sistema de Rifa Altruista

Sistema completo de gestión de rifas con causa benéfica. Permite la venta de boletos en línea mediante transferencias bancarias, con validación administrativa y panel de control.

## 🌟 Características Principales

### Para Usuarios
- ✅ Registro y autenticación con verificación de email
- 🎫 Visualización en tiempo real de boletos disponibles
- 🛒 Selección y reserva temporal de boletos
- 💳 Sistema de pago por transferencia bancaria
- 📧 Notificaciones por email en cada etapa
- 📊 Dashboard personal con historial de compras
- ⏰ Contador regresivo al sorteo

### Para Administradores
- 👨‍💼 Panel de administración completo
- ✅ Validación manual/semi-automática de transferencias
- 🏪 Registro de ventas físicas (efectivo)
- 📊 Estadísticas y reportes en tiempo real
- 📧 Sistema de notificaciones automáticas
- 🔒 Control de acceso por roles

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js
- **Emails**: Nodemailer
- **Almacenamiento**: Sistema de archivos local (comprobantes)

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 14+
- Cuenta de correo para SMTP (Gmail, SendGrid, etc.)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repo>
cd rifa-altruista
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (copia `.env.example`):

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/rifa_altruista"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-seguro-aqui"

# Email (ejemplo con Gmail)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-password-app"
EMAIL_FROM="noreply@rifaaltruista.com"

# Configuración de la Rifa
NEXT_PUBLIC_RAFFLE_NAME="Rifa Altruista"
NEXT_PUBLIC_RAFFLE_CAUSE="Apoyo a niños con cáncer"
NEXT_PUBLIC_RAFFLE_PRIZE="Auto Toyota 2024"
NEXT_PUBLIC_TICKET_PRICE="100"
NEXT_PUBLIC_DRAW_DATE="2024-12-31T20:00:00"
NEXT_PUBLIC_TOTAL_TICKETS="500"
```

### 4. Configurar la base de datos

```bash
# Ejecutar migraciones
npx prisma migrate dev --name init

# Generar cliente de Prisma
npx prisma generate

# Ejecutar seed (crea admin y 500 boletos)
npx prisma db seed
```

### 5. Crear carpeta de uploads

```bash
mkdir -p public/uploads
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 👤 Credenciales por Defecto

Después del seed, puedes acceder con:

- **Email**: admin@rifaaltruista.com
- **Contraseña**: admin123456

⚠️ **IMPORTANTE**: Cambia estas credenciales en producción.

## 📁 Estructura del Proyecto

```
├── app/                    # Páginas y rutas de Next.js
│   ├── api/               # API Routes
│   │   ├── auth/         # Autenticación
│   │   ├── tickets/      # Gestión de boletos
│   │   ├── transfers/    # Transferencias
│   │   ├── admin/        # APIs de administrador
│   │   └── user/         # APIs de usuario
│   ├── auth/             # Páginas de autenticación
│   ├── admin/            # Panel de administración
│   ├── comprar/          # Página de compra
│   ├── dashboard/        # Dashboard de usuario
│   └── page.tsx          # Landing page
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuración
│   ├── prisma.ts         # Cliente de Prisma
│   ├── auth.ts           # Configuración de NextAuth
│   ├── email.ts          # Sistema de emails
│   └── utils.ts          # Funciones auxiliares
├── prisma/               # Esquema y migraciones
│   ├── schema.prisma     # Modelo de base de datos
│   └── seed.ts           # Datos iniciales
└── public/               # Archivos estáticos
    └── uploads/          # Comprobantes subidos
```

## 🔐 Configuración de Email

### Gmail

1. Habilita la verificación en 2 pasos en tu cuenta de Google
2. Genera una "contraseña de aplicación" en https://myaccount.google.com/apppasswords
3. Usa esa contraseña en `EMAIL_SERVER_PASSWORD`

### SendGrid / Mailgun

Configura las credenciales SMTP según tu proveedor.

## 📊 Flujo de Trabajo

### Compra de Boletos (Usuario)

1. Usuario se registra y verifica su email
2. Selecciona boletos disponibles
3. Los boletos se reservan por 20 minutos
4. Usuario realiza transferencia bancaria
5. Sube comprobante con folio y datos
6. Sistema valida y guarda como "pendiente"
7. Usuario recibe email de confirmación de recepción

### Validación (Admin)

1. Admin revisa transferencias pendientes
2. Verifica comprobante y datos bancarios
3. Aprueba o rechaza la transferencia
4. Si aprueba: boletos pasan a "vendidos" y usuario recibe email
5. Si rechaza: boletos se liberan y usuario recibe explicación

### Venta Física (Admin)

1. Admin accede a "Ventas Físicas"
2. Selecciona boletos vendidos en efectivo
3. Registra datos del comprador (opcional)
4. Boletos se marcan como "vendido físico"

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
```

## 🚀 Deployment (Producción)

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega

### Railway / Render

1. Crea un proyecto y conecta tu repo
2. Añade servicio de PostgreSQL
3. Configura variables de entorno
4. Despliega

### VPS / Servidor Propio

```bash
# Build
npm run build

# Iniciar con PM2
pm2 start npm --name "rifa-altruista" -- start

# O con Node.js
node .next/standalone/server.js
```

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens de verificación únicos
- ✅ Validación de archivos (comprobantes)
- ✅ Middleware de autenticación
- ✅ Protección contra duplicados (hash de archivos)
- ✅ Roles y permisos
- ✅ Sanitización de inputs

## 🐛 Troubleshooting

### Error de conexión a la base de datos

```bash
# Verifica que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verifica la URL de conexión en .env
```

### Los emails no se envían

- Verifica las credenciales SMTP
- Revisa los logs del servidor
- Confirma que el puerto no esté bloqueado

### Errores de Prisma

```bash
# Regenera el cliente
npx prisma generate

# Reinicia migraciones (⚠️ borra datos)
npx prisma migrate reset
```

## 📝 Mejoras Futuras

- [ ] Integración con Excel para importar transferencias
- [ ] Pasarela de pago (Stripe, PayPal)
- [ ] Sistema de webhooks para bancos
- [ ] App móvil
- [ ] Múltiples rifas simultáneas
- [ ] Chat en vivo de soporte
- [ ] Generación automática de reportes PDF
- [ ] Sistema de referidos

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Soporte

Si tienes preguntas o necesitas ayuda, abre un issue en GitHub.

---

Hecho con ❤️ para causas benéficas


