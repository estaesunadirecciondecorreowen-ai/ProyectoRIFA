# 🚀 Guía Completa para Desplegar en Render

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener:
- ✅ Cuenta en [Render.com](https://render.com) (puedes usar GitHub para registrarte)
- ✅ Cuenta en [GitHub](https://github.com) con el repositorio del proyecto
- ✅ Todos los cambios guardados en Git

---

## 📦 PASO 1: Preparar el Proyecto para Producción

### 1.1. Verificar el archivo `package.json`

Abre `package.json` y asegúrate de que el script `build` esté así:

```json
"scripts": {
  "dev": "next dev",
  "build": "npx prisma generate && npx prisma db push --accept-data-loss && next build",
  "start": "next start",
  "lint": "next lint",
  "postinstall": "prisma generate"
}
```

### 1.2. Verificar variables de entorno

Tu archivo `.env` debe tener estas variables (NO subas este archivo a GitHub):

```env
DATABASE_URL="postgresql://neondb_owner:npg_anbmFAE6V8eI@ep-little-dust-afway67t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_URL="https://tu-proyecto.onrender.com"
NEXTAUTH_SECRET="tu-secret-muy-largo-y-aleatorio"
NEXT_PUBLIC_TICKET_PRICE="50"
NEXT_PUBLIC_DRAW_DATE="2026-01-06T18:00:00"
```

⚠️ **IMPORTANTE**: Cambia `NEXTAUTH_SECRET` por un string aleatorio muy largo. Puedes generarlo con:

```bash
openssl rand -base64 32
```

O en PowerShell:
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 1.3. Asegurarse de que `.gitignore` incluye archivos sensibles

Verifica que `.gitignore` contenga:

```
.env
.env.local
.env.production
node_modules/
.next/
tickets_pdf/
```

---

## 🌐 PASO 2: Subir el Proyecto a GitHub

### 2.1. Inicializar Git (si no lo has hecho)

```bash
git init
git add .
git commit -m "Preparando para producción"
```

### 2.2. Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com) y haz clic en **"New repository"**
2. Nombre del repositorio: `rifa-altruista` (o el que prefieras)
3. **NO** marques "Initialize this repository with a README"
4. Haz clic en **"Create repository"**

### 2.3. Conectar y subir el código

```bash
git remote add origin https://github.com/TU-USUARIO/rifa-altruista.git
git branch -M main
git push -u origin main
```

Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub.

---

## 🎯 PASO 3: Configurar Base de Datos en Neon.tech

Ya tienes una base de datos de Neon configurada. Solo asegúrate de que:

1. La base de datos esté activa en [Neon.tech](https://neon.tech)
2. Tengas la URL de conexión (la que ya tienes en tu `.env`)
3. La base de datos esté vacía o con los datos que quieras mantener

**Tu URL actual:**
```
postgresql://neondb_owner:npg_anbmFAE6V8eI@ep-little-dust-afway67t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

---

## 🚢 PASO 4: Desplegar en Render

### 4.1. Crear cuenta en Render

1. Ve a [Render.com](https://render.com)
2. Haz clic en **"Get Started"**
3. Registrate con tu cuenta de GitHub
4. Autoriza a Render para acceder a tus repositorios

### 4.2. Crear un nuevo Web Service

1. En el Dashboard de Render, haz clic en **"New +"**
2. Selecciona **"Web Service"**
3. Conecta tu repositorio de GitHub:
   - Si no aparece, haz clic en **"Configure account"** y autoriza el repositorio específico
4. Selecciona el repositorio **`rifa-altruista`**

### 4.3. Configurar el Web Service

Completa el formulario con estos datos:

**Name (Nombre del servicio):**
```
rifa-altruista
```

**Region (Región):**
```
Oregon (US West) o la más cercana a México
```

**Branch (Rama):**
```
main
```

**Root Directory (Directorio raíz):**
```
(déjalo vacío)
```

**Runtime (Entorno):**
```
Node
```

**Build Command (Comando de construcción):**
```
npm install && npx prisma generate && npx prisma db push --accept-data-loss && npm run build
```

**Start Command (Comando de inicio):**
```
npm start
```

**Instance Type (Tipo de instancia):**
```
Free (Gratis)
```

### 4.4. Configurar Variables de Entorno

En la sección **"Environment Variables"**, haz clic en **"Add Environment Variable"** y agrega cada una de estas:

| Key (Nombre) | Value (Valor) |
|--------------|---------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_anbmFAE6V8eI@ep-little-dust-afway67t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | `https://rifa-altruista.onrender.com` (ajusta según tu URL final) |
| `NEXTAUTH_SECRET` | (tu secret generado, ejemplo: `dkF8j2KdmE9xLp4Qw7Yz3Nm1Vb6Rt5Gh8Uc0Sa2We7=`) |
| `NEXT_PUBLIC_TICKET_PRICE` | `50` |
| `NEXT_PUBLIC_DRAW_DATE` | `2026-01-06T18:00:00` |
| `NODE_VERSION` | `18` |

⚠️ **MUY IMPORTANTE**: 
- Cambia `NEXTAUTH_SECRET` por uno único generado con el comando que te di arriba
- Ajusta `NEXTAUTH_URL` con la URL real que te dará Render (la verás después de crear el servicio)

### 4.5. Crear el Servicio

1. Haz clic en **"Create Web Service"** al final del formulario
2. Render comenzará a desplegar tu aplicación
3. Esto puede tomar **5-10 minutos** la primera vez

---

## ⏳ PASO 5: Esperar y Verificar el Despliegue

### 5.1. Monitorear el progreso

En la página del servicio verás:
- **Logs en tiempo real** del proceso de construcción
- El estado cambiará de "Building" → "Deploying" → "Live"

Busca en los logs estas líneas para confirmar que todo va bien:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Collecting build traces
✓ Finalizing page optimization
```

### 5.2. Obtener la URL de tu aplicación

Una vez que el despliegue termine, Render te dará una URL como:

```
https://rifa-altruista.onrender.com
```

O algo similar. **Copia esta URL**.

---

## 🔧 PASO 6: Actualizar NEXTAUTH_URL

### 6.1. Actualizar la variable de entorno

1. Ve a la sección **"Environment"** en tu servicio de Render
2. Busca la variable `NEXTAUTH_URL`
3. Actualízala con la URL real que te dio Render
4. Haz clic en **"Save Changes"**
5. Render automáticamente volverá a desplegar con la nueva configuración

---

## 🎨 PASO 7: Inicializar la Base de Datos

### 7.1. Crear boletos iniciales

Una vez que tu app esté funcionando, necesitas crear los 500 boletos:

**Opción A: Desde tu computadora local**

1. Conecta a la base de datos de producción temporalmente:
   ```bash
   # En tu .env local, cambia temporalmente DATABASE_URL a la de producción
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

2. Después regresa el DATABASE_URL a tu base de datos local

**Opción B: Desde la Shell de Render (Recomendado)**

1. En tu servicio de Render, ve a **"Shell"** (en el menú lateral)
2. Haz clic en **"Launch Shell"**
3. Ejecuta:
   ```bash
   npx tsx prisma/seed.ts
   ```

### 7.2. Crear usuario administrador

En la Shell de Render (o localmente conectado a producción):

```bash
npx tsx scripts/crear-admin-rapido.ts
```

Esto creará un admin con:
- **Email**: `admin@rifa.com`
- **Password**: `Admin123!`

⚠️ **IMPORTANTE**: Cambia esta contraseña después del primer login.

---

## ✅ PASO 8: Verificar que Todo Funciona

### 8.1. Probar la aplicación

1. Abre tu URL de Render en el navegador: `https://tu-app.onrender.com`
2. Deberías ver la página principal con el fondo navideño y nieve cayendo
3. Verifica que puedas:
   - Ver los boletos disponibles
   - Iniciar sesión como admin
   - Registrar un usuario nuevo
   - Comprar un boleto (proceso completo)

### 8.2. Probar el panel de administrador

1. Inicia sesión con `admin@rifa.com` / `Admin123!`
2. Ve a `/admin`
3. Verifica que puedas:
   - Ver estadísticas
   - Liberar boletos
   - Registrar ventas físicas
   - Validar transferencias

---

## 🔄 PASO 9: Actualizaciones Futuras

Cada vez que hagas cambios en tu código:

### 9.1. Guardar cambios en Git

```bash
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

### 9.2. Render automáticamente desplegará

Render detectará los cambios en GitHub y automáticamente:
1. Descargará el nuevo código
2. Ejecutará el build
3. Desplegará la nueva versión

Esto toma **5-10 minutos** cada vez.

---

## 📊 PASO 10: Configurar Dominio Personalizado (Opcional)

Si tienes un dominio propio (ejemplo: `rifaaltruista.com`):

### 10.1. En Render

1. Ve a la sección **"Settings"** de tu servicio
2. Busca **"Custom Domain"**
3. Haz clic en **"Add Custom Domain"**
4. Ingresa tu dominio: `www.rifaaltruista.com`

### 10.2. En tu proveedor de dominios

Agrega estos registros DNS:

**Registro CNAME:**
```
Host: www
Value: tu-app.onrender.com
```

**Registro A (para el dominio raíz):**
Render te dará la IP exacta en la configuración.

### 10.3. Actualizar NEXTAUTH_URL

Cambia la variable de entorno `NEXTAUTH_URL` a tu nuevo dominio:
```
https://www.rifaaltruista.com
```

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

### Error: "Application failed to respond"

**Causa**: El servidor no inició correctamente.

**Solución**:
1. Revisa los logs en Render
2. Verifica que todas las variables de entorno estén correctas
3. Asegúrate de que `DATABASE_URL` esté bien escrita

### Error: "Prisma Client could not connect to the database"

**Causa**: La URL de la base de datos es incorrecta.

**Solución**:
1. Verifica que `DATABASE_URL` en Render sea idéntica a la de tu `.env` local
2. Asegúrate de que incluya `?sslmode=require`
3. Verifica que la base de datos de Neon esté activa

### Error: "Invalid `prisma.ticket.findMany()` invocation"

**Causa**: Las tablas no existen en la base de datos.

**Solución**:
1. Conecta a la Shell de Render
2. Ejecuta: `npx prisma db push`
3. Ejecuta: `npx tsx prisma/seed.ts`

### Error: "NextAuth configuration error"

**Causa**: `NEXTAUTH_URL` o `NEXTAUTH_SECRET` no están configurados.

**Solución**:
1. Verifica que ambas variables estén en la configuración de Render
2. Asegúrate de que `NEXTAUTH_URL` sea HTTPS (no HTTP)
3. Genera un nuevo `NEXTAUTH_SECRET` si es necesario

---

## 📱 PASO 11: Optimizaciones Post-Despliegue

### 11.1. Configurar plan de instancia

El plan gratuito de Render:
- ✅ Es suficiente para empezar
- ⚠️ Se "duerme" después de 15 minutos de inactividad
- ⚠️ La primera solicitud después de dormir tarda 30-60 segundos

Para evitar esto:
- **Opción 1**: Actualiza a un plan de pago ($7/mes) que mantiene la app siempre activa
- **Opción 2**: Usa un servicio como UptimeRobot para hacer ping cada 10 minutos

### 11.2. Configurar backups de base de datos

En Neon.tech:
1. Ve a tu proyecto
2. Configura backups automáticos en **"Settings" → "Backups"**
3. Neon ofrece backups diarios en el plan gratuito

---

## 🎉 ¡LISTO!

Tu aplicación de rifa ahora está en línea y funcionando en Render. Puedes compartir la URL con tus usuarios.

### Checklist Final:

- [ ] La app carga correctamente en la URL de Render
- [ ] Los 500 boletos están creados
- [ ] El usuario admin funciona
- [ ] El registro de usuarios funciona
- [ ] La compra de boletos funciona
- [ ] El panel de admin es accesible
- [ ] Las transferencias se pueden validar
- [ ] Las ventas físicas se pueden registrar
- [ ] Los emails se envían correctamente (si configuraste SMTP)
- [ ] El tema navideño se ve correctamente

### URLs Importantes:

- **Tu app**: `https://tu-app.onrender.com`
- **Panel admin**: `https://tu-app.onrender.com/admin`
- **Dashboard Render**: `https://dashboard.render.com`
- **Dashboard Neon**: `https://console.neon.tech`

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs en Render Dashboard
2. Revisa esta guía paso a paso
3. Verifica las variables de entorno
4. Asegúrate de que la base de datos esté activa

¡Buena suerte con tu rifa! 🎫🎄

