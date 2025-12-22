# 🔧 Guía para Desarrollo Local

## Problema Actual

La base de datos de Supabase no es accesible desde tu máquina local. Necesitas configurar una base de datos PostgreSQL para desarrollo.

---

## ✅ OPCIÓN 1: Base de Datos Gratuita en la Nube (MÁS FÁCIL)

### Neon.tech (Recomendado - 3 GB gratis)

1. Ve a https://neon.tech y crea una cuenta
2. Crea un nuevo proyecto
3. Copia la "Connection String"
4. Actualiza tu `.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"
```

### Alternativas:
- **Supabase**: https://supabase.com (500 MB gratis)
- **Railway**: https://railway.app (500 horas gratis)
- **ElephantSQL**: https://elephantsql.com (20 MB gratis)

---

## ✅ OPCIÓN 2: Docker (Si tienes Docker Desktop)

### Instalar Docker Desktop

1. Descarga Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Instálalo y reinicia tu computadora
3. Abre Docker Desktop

### Iniciar PostgreSQL

El proyecto ya incluye un archivo `docker-compose.yml`. Ejecuta:

```powershell
# Iniciar PostgreSQL
docker-compose up -d

# Verificar que está corriendo
docker ps
```

### Actualizar .env

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/rifa_altruista?schema=public"
```

### Comandos útiles

```powershell
# Detener PostgreSQL
docker-compose down

# Ver logs
docker-compose logs postgres

# Reiniciar desde cero (BORRA TODO)
docker-compose down -v
docker-compose up -d
```

---

## ✅ OPCIÓN 3: Instalar PostgreSQL Localmente

### Descargar e Instalar

1. Ve a: https://www.postgresql.org/download/windows/
2. Descarga el instalador
3. Durante la instalación:
   - Usuario: `postgres`
   - Contraseña: (elige una y recuérdala)
   - Puerto: `5432`

### Crear Base de Datos

```powershell
# Abrir PowerShell como Administrador
# Navegar a la carpeta de PostgreSQL
cd "C:\Program Files\PostgreSQL\16\bin"

# Conectar a PostgreSQL
.\psql.exe -U postgres

# En psql, ejecutar:
CREATE DATABASE rifa_altruista;
\q
```

### Actualizar .env

```env
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/rifa_altruista?schema=public"
```

---

## 🚀 Después de Configurar la Base de Datos

Una vez que tengas la `DATABASE_URL` correcta en tu `.env`:

```powershell
# 1. Generar el cliente de Prisma
npx prisma generate

# 2. Crear las tablas
npx prisma db push

# 3. Poblar con datos iniciales (500 boletos + admin)
npx prisma db seed

# 4. Iniciar el servidor de desarrollo
npm run dev
```

### Verificar que todo funciona

```powershell
# En otra terminal, ver los datos
npx prisma studio
```

Esto abrirá una interfaz web en http://localhost:5555 donde puedes ver y editar los datos.

---

## 🎯 Acceder a la Aplicación

- **URL**: http://localhost:3000
- **Admin**:
  - Email: `admin@rifa.com`
  - Password: `Admin123!`

---

## 📋 Comandos Útiles

```powershell
# Servidor de desarrollo
npm run dev

# Ver/editar base de datos
npx prisma studio

# Reiniciar base de datos (BORRA TODO)
npx prisma db push --force-reset
npx prisma db seed

# Ver las queries de Prisma
$env:DEBUG="prisma*"
npm run dev

# Usar otro puerto si 3000 está ocupado
npm run dev -- -p 3001
```

---

## 🚨 Solución de Problemas

### ❌ Error: "Can't reach database server"

**Soluciones:**
```powershell
# Verificar que la URL es correcta
Get-Content .env | Select-String "DATABASE_URL"

# Si usas Docker, verifica que está corriendo
docker ps

# Si usas PostgreSQL local, verifica el servicio
Get-Service postgresql*

# Probar la conexión
npx prisma db push
```

### ❌ Error: "Table does not exist"

```powershell
npx prisma db push
npx prisma db seed
```

### ❌ Error: "Prisma Client not generated"

```powershell
npx prisma generate
```

### ❌ Puerto 3000 ocupado

```powershell
# Opción 1: Usar otro puerto
npm run dev -- -p 3001

# Opción 2: Matar el proceso
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### ❌ Error: "P1012: Error validating"

Esto significa que el schema no es compatible. Asegúrate de que `prisma/schema.prisma` tiene:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 🔄 Flujo de Trabajo Recomendado

```powershell
# Al iniciar el día
docker-compose up -d    # Si usas Docker
npm run dev

# Trabajando
# ... editar código ...
# Next.js recarga automáticamente

# Ver datos
npx prisma studio

# Si cambias el schema
npx prisma db push
npx prisma generate

# Al terminar
# Ctrl+C para detener npm run dev
docker-compose down    # Si usas Docker
```

---

## 🌟 Recomendación Final

Para desarrollo local, te recomiendo:

1. **Más fácil**: Usa **Neon.tech** (base de datos gratuita en la nube)
   - ✅ Sin instalación
   - ✅ Funciona inmediatamente
   - ✅ 3 GB gratis
   
2. **Más control**: Usa **Docker** (si tienes o puedes instalar Docker Desktop)
   - ✅ Base de datos local
   - ✅ Fácil de reiniciar
   - ✅ No afecta tu sistema
   
3. **Producción-like**: Instala **PostgreSQL** localmente
   - ✅ Mismo que producción
   - ✅ Más rápido
   - ⚠️ Requiere instalación

---

**¿Listo para empezar?** Elige una opción, configura tu `.env`, y ejecuta:

```powershell
npx prisma db push
npx prisma db seed
npm run dev
```

🎉 ¡Tu aplicación estará corriendo en http://localhost:3000!
