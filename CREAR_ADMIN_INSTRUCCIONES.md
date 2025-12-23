# 🚀 Instrucciones Rápidas: Crear Administrador Seguro

## Pasos para Crear el Nuevo Administrador

### 1️⃣ Abrir Terminal en el Proyecto

Abre PowerShell o la terminal de tu editor en la carpeta del proyecto:
```
C:\Proyecto\ProyectoAltruista
```

### 2️⃣ Ejecutar el Script

Ejecuta uno de estos comandos (ambos hacen lo mismo):

**Opción 1 - Comando corto (recomendado):**
```bash
npm run crear-admin
```

**Opción 2 - Comando completo:**
```bash
npx tsx scripts/crear-admin-seguro.ts
```

### 3️⃣ Esperar Confirmación

Verás un mensaje como este:

```
🔐 Creando nuevo usuario administrador con credenciales seguras

✅ ¡Usuario administrador creado exitosamente!

📧 Email: superadmin@rifa.com
👤 Nombre: Super Admin
🔑 Rol: ADMINISTRADOR
🔒 Contraseña: Admin2026!Seguro#ProyectoAltruista$

🔗 Inicia sesión en: http://localhost:3000/auth/login
🌐 O en producción: https://tu-dominio.onrender.com/auth/login

⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:       superadmin@rifa.com
Contraseña:  Admin2026!Seguro#ProyectoAltruista$
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4️⃣ Iniciar Sesión

Ve a la página de login:
- **Local:** http://localhost:3000/auth/login
- **Producción:** https://tu-dominio.onrender.com/auth/login

Usa las credenciales:
- **Email:** `superadmin@rifa.com`
- **Contraseña:** `Admin2026!Seguro#ProyectoAltruista$`

## ✅ Cambios Realizados

### 1. Títulos en Azul Rey
Los tres títulos de las tarjetas ahora están en azul rey:
- ✅ "Apoyas una causa"
- ✅ "Fácil de participar"
- ✅ "Sorteo transparente"

### 2. Nueva Cuenta Admin
Se creó un script que genera automáticamente:
- ✅ Email: `superadmin@rifa.com`
- ✅ Contraseña segura: `Admin2026!Seguro#ProyectoAltruista$`
- ✅ Rol: ADMINISTRADOR
- ✅ Email verificado automáticamente

## 📝 Notas Importantes

1. **El script es inteligente:**
   - Si el usuario NO existe → lo crea
   - Si el usuario YA existe → actualiza la contraseña

2. **Seguridad:**
   - La contraseña tiene más de 30 caracteres
   - Incluye mayúsculas, minúsculas, números y símbolos
   - Es difícil de adivinar pero fácil de copiar y pegar

3. **Archivos de credenciales:**
   - Ya están en `.gitignore`
   - NO se subirán a GitHub
   - Guárdalos en un lugar seguro

## 🔧 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
npx prisma generate
```

### Error: "Database connection failed"
Verifica que tu archivo `.env` tenga la variable `DATABASE_URL` correcta.

### Error: "User already exists"
El script automáticamente actualiza la contraseña si el usuario ya existe.

## 🎨 Verificar los Cambios Visuales

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Abre el navegador en: http://localhost:3000

3. Busca la sección "El Gran Premio"

4. Verifica que los tres títulos estén en **azul rey** (color azul oscuro):
   - Apoyas una causa
   - Fácil de participar
   - Sorteo transparente

## 📚 Archivos Relacionados

- `scripts/crear-admin-seguro.ts` - Script para crear el admin
- `CREDENCIALES_ADMIN_SEGURO.md` - Documentación completa de credenciales
- `app/page.tsx` - Página principal con los títulos en azul rey
- `.gitignore` - Protege los archivos de credenciales

---

**¿Necesitas ayuda?** Revisa el archivo `CREDENCIALES_ADMIN_SEGURO.md` para más detalles.

