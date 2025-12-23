# 🚀 Inicializar Base de Datos SIN Shell de Render

## ⚠️ Problema: No puedes acceder a Shell

Si no puedes acceder a la Shell de Render (común en cuentas gratuitas), usa este método alternativo.

---

## ✅ SOLUCIÓN: Usar Endpoint de Inicialización

He creado un endpoint especial que inicializa la base de datos mediante una llamada HTTP.

---

## 📋 PASOS:

### 1️⃣ Espera a que el Deploy Termine

Verifica en Render que tu app diga: **"Your service is live 🎉"**

### 2️⃣ Obtén tu URL de Render

Tu URL será algo como:
```
https://proyectorifa.onrender.com
```

### 3️⃣ Inicializa la Base de Datos

**Opción A: Desde tu Navegador**

Abre una nueva pestaña y ve a:
```
https://TU-URL.onrender.com/api/admin/init-db
```

Haz clic derecho → **Inspeccionar** → **Console** → Pega este código:

```javascript
fetch('/api/admin/init-db', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log('✅ Resultado:', data))
.catch(err => console.error('❌ Error:', err));
```

**Opción B: Desde PowerShell (tu computadora)**

```powershell
$url = "https://TU-URL.onrender.com/api/admin/init-db"
$response = Invoke-RestMethod -Uri $url -Method POST -ContentType "application/json"
$response | ConvertTo-Json
```

**Opción C: Desde Postman o Thunder Client**

- **URL**: `https://TU-URL.onrender.com/api/admin/init-db`
- **Método**: `POST`
- **Headers**: `Content-Type: application/json`
- Haz clic en **Send**

---

## ✅ Respuesta Exitosa

Deberías ver algo como:

```json
{
  "message": "Base de datos inicializada exitosamente",
  "tickets": 500,
  "admin": {
    "email": "admin@rifaaltruista.com",
    "password": "admin123456",
    "warning": "⚠️ CAMBIA ESTA CONTRASEÑA INMEDIATAMENTE"
  }
}
```

---

## 🎯 Credenciales de Admin

Una vez inicializada, usa estas credenciales para entrar:

- **URL de Login**: `https://TU-URL.onrender.com/auth/login`
- **Email**: `admin@rifaaltruista.com`
- **Password**: `admin123456`

⚠️ **IMPORTANTE**: Cambia la contraseña inmediatamente después del primer login.

---

## ❌ Errores Comunes

### Error: "La base de datos ya está inicializada"

**Causa**: Ya ejecutaste el endpoint antes.

**Solución**: 
- Si necesitas reinicializar, tendrás que borrar todos los datos de la base de datos en Neon.tech
- O crear una nueva base de datos

### Error: "Cannot connect to database"

**Causa**: La variable `DATABASE_URL` no está configurada correctamente.

**Solución**:
1. Ve a Render → Environment
2. Verifica que `DATABASE_URL` sea correcta
3. Guarda y espera el redeploy

### Error: 404 Not Found

**Causa**: El deploy no terminó o falló.

**Solución**:
1. Verifica en Render que el deploy haya terminado exitosamente
2. Revisa los logs para ver si hay errores
3. Asegúrate de que la URL sea correcta

---

## 🔐 Seguridad

⚠️ **Este endpoint solo funciona UNA VEZ**. Después de la primera ejecución exitosa, se bloqueará automáticamente para evitar que alguien más reinicialice tu base de datos.

Si necesitas ejecutarlo de nuevo, tendrás que:
1. Borrar todos los usuarios de la base de datos manualmente
2. O crear una nueva base de datos

---

## 🎉 ¡Listo!

Una vez que veas la respuesta exitosa:

1. ✅ Tienes 500 boletos creados
2. ✅ Tienes un usuario admin
3. ✅ Tu app está lista para usarse

Ve a: `https://TU-URL.onrender.com` y disfruta tu rifa! 🎫

