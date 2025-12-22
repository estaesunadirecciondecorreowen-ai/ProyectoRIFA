# 🎉 ¡Proyecto Configurado y Corriendo!

## ✅ Estado Actual

Tu proyecto está configurado y el servidor de desarrollo está corriendo.

### Configuración Completada:

- ✅ Base de datos conectada (Neon.tech)
- ✅ Cliente de Prisma generado
- ✅ Todas las tablas creadas
- ✅ 500 boletos creados
- ✅ Usuario administrador creado
- ✅ Servidor de desarrollo iniciado

---

## 🚀 Acceder a la Aplicación

### URL Principal
**http://localhost:3000**

### Credenciales de Administrador
- **Email:** `admin@rifa.com`
- **Password:** `Admin123!`

---

## 📱 Páginas Disponibles

### Públicas (sin login)
- **`/`** - Página principal
- **`/auth/login`** - Iniciar sesión
- **`/auth/register`** - Registrarse

### Usuario (requiere login)
- **`/dashboard`** - Panel de usuario
- **`/comprar`** - Comprar boletos

### Administrador (requiere login como admin)
- **`/admin`** - Panel de administración
- **`/admin/transfers`** - Validar transferencias
- **`/admin/physical-sales`** - Registro de ventas físicas

---

## 🛠️ Comandos Útiles

### Servidor de Desarrollo

```powershell
# Iniciar servidor (si no está corriendo)
npm run dev

# Ver en otro puerto si 3000 está ocupado
npm run dev -- -p 3001

# Detener servidor (Ctrl+C en la terminal)
```

### Base de Datos

```powershell
# Ver/editar datos visualmente
npx prisma studio

# Sincronizar cambios del schema
npx prisma db push

# Repoblar datos (si borraste algo)
npx prisma db seed

# Reiniciar base de datos (BORRA TODO)
npx prisma db push --force-reset
npx prisma db seed
```

### Ver Logs

```powershell
# Si el servidor está en segundo plano, puedes ver los logs
# revisando la terminal donde lo ejecutaste
```

---

## 🎯 Flujo de Prueba Rápido

### 1. Como Usuario Normal

1. Abre **http://localhost:3000**
2. Click en "Registrarse"
3. Crea una cuenta con tu email
4. Inicia sesión
5. Ve a "Comprar Boletos"
6. Selecciona algunos boletos
7. Prueba el proceso de compra

### 2. Como Administrador

1. Cierra sesión (si estás logueado)
2. Inicia sesión con:
   - Email: `admin@rifa.com`
   - Password: `Admin123!`
3. Ve a **`/admin`**
4. Explora el panel de administración
5. Prueba validar transferencias en **`/admin/transfers`**
6. Registra ventas físicas en **`/admin/physical-sales`**

---

## 📊 Ver los Datos

Para ver los datos en tu base de datos de forma visual:

```powershell
npx prisma studio
```

Esto abrirá **http://localhost:5555** con una interfaz donde puedes:
- Ver todos los usuarios
- Ver todos los boletos y sus estados
- Ver las compras
- Editar datos manualmente
- Eliminar registros

---

## 🐛 Solución de Problemas

### El servidor no inicia

```powershell
# Verifica que no hay otro proceso en el puerto 3000
Get-NetTCPConnection -LocalPort 3000

# Si hay algo, mátalo
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Vuelve a iniciar
npm run dev
```

### Error de base de datos

```powershell
# Verifica la conexión
npx prisma db push

# Si falla, verifica tu .env
Get-Content .env | Select-String "DATABASE_URL"
```

### Error "Module not found"

```powershell
# Reinstala dependencias
npm install

# Regenera Prisma
npx prisma generate
```

### Página en blanco o error 500

1. Abre las herramientas de desarrollador (F12)
2. Revisa la consola del navegador
3. Revisa la terminal donde corre `npm run dev`
4. Verifica que la base de datos tiene datos (usa `npx prisma studio`)

---

## 📧 Configurar Emails (Opcional)

Para que funcionen los emails de verificación y notificaciones:

1. Edita `.env`
2. Configura las variables EMAIL_*:

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASS="tu-password-de-aplicacion-de-gmail"
EMAIL_FROM="Proyecto Altruista <tu-email@gmail.com>"
```

3. Si usas Gmail, activa "Contraseñas de aplicación":
   - https://myaccount.google.com/apppasswords

---

## 🚀 Próximos Pasos

### Desarrollo

1. Personaliza los textos en las páginas
2. Ajusta los colores en `tailwind.config.ts`
3. Modifica el precio de los boletos en el código
4. Agrega más funcionalidades

### Para Producción

Cuando estés listo para desplegar:

1. Lee **`DESPLIEGUE.md`**
2. Configura las variables de entorno en Render
3. Despliega desde Git
4. ¡Ya está!

---

## 📚 Archivos de Ayuda

- **`DESARROLLO_LOCAL.md`** - Configuración detallada local
- **`DESPLIEGUE.md`** - Cómo desplegar a producción
- **`ESTRUCTURA.md`** - Estructura del proyecto
- **`RESUMEN_DEL_PROYECTO.md`** - Funcionalidades completas

---

## 🎉 ¡Listo!

Tu aplicación está corriendo en **http://localhost:3000**

**¡Abre el navegador y empieza a probar!** 🚀

