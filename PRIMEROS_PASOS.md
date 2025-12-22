# 🚀 Primeros Pasos - Inicio Rápido

Esta guía te ayudará a tener el sistema funcionando en **menos de 10 minutos**.

## ✅ Pre-requisitos Verificados

Antes de empezar, asegúrate de tener:

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] PostgreSQL 14+ instalado y corriendo
- [ ] Un editor de código (VS Code, Cursor, etc.)
- [ ] Cuenta de correo para SMTP (Gmail recomendado)

## 🎯 5 Pasos para Empezar

### 1️⃣ Instalar Dependencias (2 min)

```bash
npm install
```

Espera a que termine la instalación.

### 2️⃣ Configurar Base de Datos (1 min)

Crea la base de datos en PostgreSQL:

```bash
# Si tienes psql instalado
createdb rifa_altruista

# O desde pgAdmin, crea una BD llamada "rifa_altruista"
```

### 3️⃣ Configurar Variables de Entorno (3 min)

Copia el archivo de ejemplo:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edita `.env` y configura:

**OBLIGATORIO:**
```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/rifa_altruista"
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-password-de-app"
```

**Opcional (puedes dejarlo por defecto):**
```env
NEXT_PUBLIC_RAFFLE_NAME="Mi Rifa"
NEXT_PUBLIC_RAFFLE_CAUSE="Mi Causa"
NEXT_PUBLIC_RAFFLE_PRIZE="Mi Premio"
NEXT_PUBLIC_TICKET_PRICE="100"
```

### 4️⃣ Inicializar Base de Datos (2 min)

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

Si todo salió bien, verás:
```
✅ Usuario administrador creado:
   Email: admin@rifaaltruista.com
   Contraseña: admin123456
✅ 500 boletos creados exitosamente
```

### 5️⃣ Iniciar el Servidor (1 min)

```bash
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

## 🎉 ¡Listo! Ahora Prueba Estas Cosas

### ✅ Checklist de Pruebas

1. **Ver la landing page**
   - Abre http://localhost:3000
   - Deberías ver la página principal con el contador y los boletos

2. **Iniciar sesión como admin**
   - Ve a http://localhost:3000/auth/login
   - Email: `admin@rifaaltruista.com`
   - Contraseña: `admin123456`
   - Haz clic en "Panel Admin"

3. **Registrar un usuario**
   - Cierra sesión
   - Ve a "Registrarse"
   - Usa un email real al que tengas acceso
   - Revisa tu correo y verifica la cuenta

4. **Comprar boletos (como usuario)**
   - Inicia sesión con tu usuario registrado
   - Ve a "Comprar Boletos"
   - Selecciona 2-3 boletos
   - Reserva
   - Sube cualquier imagen como comprobante (es de prueba)

5. **Validar transferencia (como admin)**
   - Inicia sesión como admin
   - Ve a "Validar Transferencias"
   - Verás la transferencia pendiente
   - Apruébala
   - El usuario recibirá un email de confirmación

## 🐛 Solución Rápida de Problemas

### ❌ Error: "Can't reach database server"

**Solución:**
```bash
# Verifica que PostgreSQL esté corriendo
# Windows: Services -> PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

### ❌ Error: "Module not found"

**Solución:**
```bash
rm -rf node_modules
npm install
```

### ❌ Los emails no llegan

**Solución:**
1. Verifica que usaste una **contraseña de aplicación** de Gmail, no tu contraseña normal
2. Ve a https://myaccount.google.com/apppasswords
3. Genera una nueva
4. Actualiza `.env`
5. Reinicia el servidor

### ❌ Puerto 3000 en uso

**Solución:**
```bash
# Usa otro puerto
PORT=3001 npm run dev
```

## 📚 ¿Qué Hacer Después?

Una vez que tengas todo funcionando:

1. **Lee el manual de uso**
   - `MANUAL_DE_USO.md` - Cómo usar todas las funciones

2. **Cambia la contraseña del admin**
   - Inicia sesión como admin
   - (Puedes crear un nuevo admin con `node scripts/create-admin.js`)

3. **Personaliza tu rifa**
   - Edita las variables en `.env`
   - Cambia el nombre, causa, premio, precio
   - Reinicia el servidor para ver los cambios

4. **Configura los emails correctamente**
   - Asegúrate de que los emails se envíen bien
   - Haz pruebas de registro y compra

5. **Prueba el flujo completo**
   - Registra varios usuarios
   - Compra boletos
   - Valida transferencias
   - Registra ventas físicas

## 🎓 Recursos de Aprendizaje

Si eres nuevo en alguna de estas tecnologías:

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **NextAuth.js**: https://next-auth.js.org/

## 💡 Tips Útiles

### Ver la base de datos visualmente

```bash
npx prisma studio
```

Se abrirá en http://localhost:5555

### Reiniciar la base de datos

```bash
npx prisma migrate reset
npx prisma db seed
```

⚠️ Esto borra todos los datos

### Crear más administradores

```bash
node scripts/create-admin.js
```

### Ver logs en tiempo real

Los logs aparecen en la terminal donde corre `npm run dev`

## 📞 Necesitas Ayuda?

Si algo no funciona:

1. Revisa los errores en la terminal
2. Busca en `INSTALACION.md` la guía detallada
3. Revisa `README.md` para más información técnica
4. Busca el error en Google
5. Abre un issue en GitHub

## 🎯 Objetivos Cumplidos

Si llegaste hasta aquí y todo funciona:

- ✅ Sistema instalado
- ✅ Base de datos configurada
- ✅ Servidor corriendo
- ✅ Admin creado
- ✅ 500 boletos listos
- ✅ Emails funcionando
- ✅ Primera compra de prueba
- ✅ Primera validación

## 🚀 Siguiente Nivel

Cuando estés listo para producción:

1. Lee la sección de **Deployment** en `README.md`
2. Consigue un dominio
3. Despliega en Vercel/Railway/Render
4. Configura una base de datos en la nube
5. ¡Lanza tu rifa!

---

**¡Felicidades!** Ya tienes tu sistema de rifa funcionando. 🎉

Ahora ve a `MANUAL_DE_USO.md` para aprender a usar todas las funcionalidades.


