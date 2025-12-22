# 📦 Guía de Instalación - Sistema de Rifa Altruista

Esta guía te llevará paso a paso por la instalación del sistema en tu máquina local.

## ⚠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** versión 18 o superior
- **PostgreSQL** versión 14 o superior
- **npm** o **yarn**
- Un cliente de correo SMTP (Gmail, Outlook, SendGrid, etc.)

## 🔧 Instalación Paso a Paso

### 1. Verificar Node.js y npm

Abre tu terminal y ejecuta:

```bash
node --version
npm --version
```

Deberías ver algo como:
```
v18.17.0
9.6.7
```

Si no tienes Node.js instalado, descárgalo de [nodejs.org](https://nodejs.org/)

### 2. Instalar PostgreSQL

#### Windows
1. Descarga PostgreSQL desde [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Ejecuta el instalador
3. Durante la instalación:
   - Recuerda la contraseña que establezcas para el usuario `postgres`
   - Mantén el puerto por defecto (5432)
   - Instala pgAdmin (herramienta visual incluida)

#### macOS
```bash
# Con Homebrew
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 3. Crear la Base de Datos

Abre pgAdmin o la terminal de PostgreSQL:

```bash
# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE rifa_altruista;

# Salir
\q
```

### 4. Clonar o Descargar el Proyecto

Si tienes el proyecto en GitHub:
```bash
git clone <url-del-repositorio>
cd rifa-altruista
```

Si lo descargaste como ZIP:
1. Extrae el archivo
2. Abre una terminal en esa carpeta

### 5. Instalar Dependencias

```bash
npm install
```

Este proceso puede tomar 2-5 minutos. Verás que se descargan muchos paquetes.

### 6. Configurar Variables de Entorno

Hay un archivo `.env.example` en la raíz del proyecto. **NO edites ese archivo**.

En su lugar, crea un nuevo archivo llamado `.env` (sin extensión):

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

Ahora abre el archivo `.env` con tu editor de texto favorito y modifica:

```env
# Cambia esto con tus datos de PostgreSQL
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/rifa_altruista"
#                          ^^^^^^  ^^^^^^^^^^^
#                          usuario  contraseña

# Genera un secret seguro (puedes usar cualquier cadena larga y aleatoria)
NEXTAUTH_SECRET="escribe-aqui-una-cadena-muy-larga-y-aleatoria-123456789"

# Configuración de Gmail (si usas Gmail)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="xxxx xxxx xxxx xxxx"  # Password de aplicación (ver abajo)
EMAIL_FROM="noreply@rifaaltruista.com"

# Personaliza tu rifa
NEXT_PUBLIC_RAFFLE_NAME="Mi Rifa Benéfica"
NEXT_PUBLIC_RAFFLE_CAUSE="Apoyo a la comunidad"
NEXT_PUBLIC_RAFFLE_PRIZE="Premio increíble"
NEXT_PUBLIC_TICKET_PRICE="50"
NEXT_PUBLIC_DRAW_DATE="2025-06-30T20:00:00"
```

#### 📧 Cómo obtener la contraseña de aplicación de Gmail

1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. Ve a **Seguridad**
3. Activa la **Verificación en dos pasos** (si no la tienes)
4. Busca **Contraseñas de aplicaciones**
5. Genera una nueva para "Correo"
6. Copia esa contraseña (son 16 caracteres) y pégala en `EMAIL_SERVER_PASSWORD`

### 7. Inicializar la Base de Datos

```bash
# Crear las tablas
npx prisma migrate dev --name init

# Generar el cliente de Prisma
npx prisma generate

# Crear datos iniciales (admin + 500 boletos)
npx prisma db seed
```

Si el seed fue exitoso, verás:
```
✅ Usuario administrador creado:
   Email: admin@rifaaltruista.com
   Contraseña: admin123456
✅ 500 boletos creados exitosamente
🎉 Seed completado exitosamente
```

### 8. Crear Carpeta de Uploads

```bash
# Windows (PowerShell)
New-Item -ItemType Directory -Path "public/uploads" -Force

# macOS/Linux
mkdir -p public/uploads
```

### 9. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Verás algo como:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully
```

### 10. Abrir la Aplicación

Abre tu navegador y ve a:

**http://localhost:3000**

¡Deberías ver la landing page de la rifa! 🎉

## 🔐 Acceder como Administrador

Para probar el panel de administración:

1. Ve a **http://localhost:3000/auth/login**
2. Usa las credenciales:
   - **Email:** admin@rifaaltruista.com
   - **Contraseña:** admin123456
3. Haz clic en "Panel Admin" en la barra de navegación

## ✅ Verificar que Todo Funciona

### Test 1: Registro de Usuario
1. Ve a http://localhost:3000/auth/register
2. Regístrate con un email de prueba
3. **Importante:** Los emails se enviarán de verdad, así que usa un email al que tengas acceso
4. Revisa tu bandeja de entrada (y spam) para el email de verificación

### Test 2: Comprar Boletos
1. Inicia sesión con tu usuario registrado
2. Ve a "Comprar Boletos"
3. Selecciona algunos boletos
4. Completa el flujo de compra (puedes subir cualquier imagen como comprobante de prueba)

### Test 3: Panel de Admin
1. Inicia sesión como admin
2. Ve al "Panel Admin"
3. Verás las estadísticas y transferencias pendientes
4. Prueba validar una transferencia

## 🐛 Problemas Comunes

### Error: "Can't reach database server"

**Solución:**
- Verifica que PostgreSQL esté corriendo
- Confirma que la `DATABASE_URL` en `.env` sea correcta
- Prueba conectarte con pgAdmin

### Error: "Module not found"

**Solución:**
```bash
# Borra node_modules y reinstala
rm -rf node_modules
npm install
```

### Los emails no llegan

**Solución:**
- Verifica las credenciales de email en `.env`
- Revisa la carpeta de spam
- Mira los logs en la terminal donde corre el servidor
- Si usas Gmail, asegúrate de usar una contraseña de aplicación

### Error: "Port 3000 is already in use"

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <el-pid-que-aparece> /F

# macOS/Linux
lsof -ti:3000 | xargs kill
```

O simplemente cambia el puerto:
```bash
PORT=3001 npm run dev
```

### Error en migraciones de Prisma

**Solución:**
```bash
# Resetea la base de datos (⚠️ borra todos los datos)
npx prisma migrate reset

# O crea una nueva base de datos limpia
```

## 📊 Ver la Base de Datos (Prisma Studio)

Prisma incluye una herramienta visual para ver y editar datos:

```bash
npx prisma studio
```

Se abrirá en http://localhost:5555

## 🚀 Siguiente Paso: Producción

Para poner el sistema en producción, consulta la sección de **Deployment** en el README.md

## 💡 Consejos

1. **Backup:** Haz respaldos frecuentes de la base de datos
2. **Seguridad:** Cambia la contraseña del admin inmediatamente
3. **Emails:** Prueba que los emails funcionen antes de lanzar
4. **Monitoreo:** Revisa los logs regularmente

## 🆘 ¿Necesitas Ayuda?

Si sigues teniendo problemas:

1. Revisa los logs en la terminal
2. Busca el error en Google
3. Abre un issue en GitHub con:
   - El error completo
   - Tu sistema operativo
   - Los pasos que seguiste

---

¡Listo! Ahora tienes el sistema funcionando en tu computadora. 🎉

