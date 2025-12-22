# 🚀 Guía de Despliegue en Render

## Cambios Realizados para el Despliegue

### 1. Corrección de Autenticación (`lib/auth.ts`)
- ✅ Corregido mapeo de campos Prisma → NextAuth
- ✅ `password_hash` en lugar de `password`
- ✅ `nombre` → `name`, `rol` → `role`

### 2. Configuración de Render (`render.yaml`)
- ✅ Archivo de configuración creado
- ✅ Comandos de build incluyen sincronización de base de datos
- ✅ Variables de entorno definidas

### 3. Scripts de NPM actualizados
- ✅ Script `db:push` para sincronización manual de BD

## 📋 Pasos para Desplegar

### En Render.com

1. **Conecta tu repositorio Git**
   - Ve a Render Dashboard
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio de GitHub/GitLab

2. **Configura las Variables de Entorno**

```env
# Base de Datos (Render PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database

# NextAuth (IMPORTANTE: Cambia estos valores)
NEXTAUTH_URL=https://tu-app.onrender.com
NEXTAUTH_SECRET=genera-un-secret-aleatorio-muy-largo-aqui

# Email SMTP (Gmail como ejemplo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-de-aplicacion-de-gmail
EMAIL_FROM=Proyecto Altruista <tu-email@gmail.com>
```

3. **Genera NEXTAUTH_SECRET**

En tu terminal local, ejecuta:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia el resultado y úsalo como `NEXTAUTH_SECRET`

4. **Configura PostgreSQL**
   - En Render, crea una base de datos PostgreSQL
   - Copia la URL de conexión "Internal Database URL"
   - Pégala como valor de `DATABASE_URL`

5. **Configura el Build**

Si usas el archivo `render.yaml`, Render detectará automáticamente:
- **Build Command:** `npm install && npx prisma generate && npx prisma db push --accept-data-loss && npm run build`
- **Start Command:** `npm start`

Si configuras manualmente:
- **Environment:** Node
- **Build Command:** El comando de arriba
- **Start Command:** `npm start`

6. **Despliega**
   - Click en "Create Web Service"
   - Render automáticamente:
     - Instalará dependencias
     - Generará el cliente de Prisma
     - Sincronizará el schema con la base de datos
     - Construirá la aplicación Next.js
     - Iniciará el servidor

## 🔄 Después del Primer Despliegue

### Ejecutar el Seed (Crear datos iniciales)

**Opción 1: Desde Render Shell**
```bash
npx prisma db seed
```

**Opción 2: Crear admin manualmente**

Conecta a tu base de datos y ejecuta el script en `scripts/create-admin.js`

## ⚠️ Problemas Comunes

### Error: "Table does not exist"
**Solución:** Asegúrate de que el comando de build incluya `npx prisma db push`

### Error: "Invalid prisma.ticket.updateMany() invocation"
**Solución:** Ejecuta el seed para crear los 500 boletos iniciales

### Error: "NEXTAUTH_SECRET is not defined"
**Solución:** Genera y configura la variable de entorno `NEXTAUTH_SECRET`

### Error de autenticación
**Solución:** Verifica que `NEXTAUTH_URL` coincida exactamente con tu URL de Render

### Emails no se envían
**Solución:** 
- Si usas Gmail, habilita "Contraseñas de aplicación"
- Verifica que todas las variables EMAIL_* estén configuradas
- Revisa los logs de Render para errores SMTP

## 🔧 Comandos Útiles

```bash
# Ver logs en tiempo real
En Render Dashboard → tu servicio → Logs tab

# Shell interactivo
En Render Dashboard → tu servicio → Shell tab

# Sincronizar base de datos manualmente
npx prisma db push

# Ejecutar migraciones (si usas migraciones en lugar de push)
npx prisma migrate deploy

# Ver datos en la BD
npx prisma studio
```

## 📊 Verificación Post-Despliegue

1. ✅ La página principal carga sin errores
2. ✅ Puedes registrarte como usuario
3. ✅ Recibes email de verificación
4. ✅ Puedes iniciar sesión
5. ✅ El dashboard muestra los boletos disponibles
6. ✅ El admin puede acceder a `/admin`

## 🎯 Próximos Pasos

1. Ejecuta el seed para crear los 500 boletos
2. Crea un usuario administrador
3. Configura el correo electrónico
4. Prueba el flujo completo de compra
5. Configura un dominio personalizado (opcional)

## 📝 Notas Importantes

- **Backups:** Render hace backups automáticos de PostgreSQL (plan de pago)
- **SSL:** Render proporciona SSL gratis automáticamente
- **Reinicio:** La app se reinicia automáticamente si falla
- **Logs:** Disponibles por 7 días en plan gratuito
- **Inactividad:** El plan gratuito se suspende tras 15 minutos de inactividad

---

**¿Problemas?** Revisa los logs en Render Dashboard y verifica que todas las variables de entorno estén configuradas correctamente.

