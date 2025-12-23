# 🔥 SOLUCIÓN RÁPIDA: Inicializar Base de Datos en Render

## ⚠️ Problema: Sitio muestra "Not Found"

Esto ocurre porque **la base de datos necesita ser inicializada** después del primer deploy.

## ✅ Solución en 2 Pasos

### Opción 1: Usando tu Navegador (MÁS FÁCIL)

1. **Abre esta URL en tu navegador**:
   ```
   https://tu-app.onrender.com/api/admin/init-db
   ```
   
   **Reemplaza `tu-app` con el nombre de tu aplicación en Render**

2. **Haz un POST request**:
   - Abre la consola del navegador (F12)
   - Pega este código:
   ```javascript
   fetch('/api/admin/init-db', { method: 'POST' })
     .then(r => r.json())
     .then(data => console.log(data))
   ```

3. **Espera la respuesta** que debe decir:
   ```json
   {
     "message": "Base de datos inicializada exitosamente",
     "tickets": 500,
     "admin": {
       "email": "admin@rifaaltruista.com",
       "password": "admin123456"
     }
   }
   ```

### Opción 2: Verificar el Estado

Primero verifica si la app está funcionando:

1. **Abre**:
   ```
   https://tu-app.onrender.com/api/health
   ```

2. **Deberías ver**:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-12-...",
     "message": "Aplicación funcionando correctamente"
   }
   ```

3. **Si ves esto**, la app funciona pero necesita inicializar la BD

4. **Si no ves esto**, ve al dashboard de Render y revisa los logs

## 🔍 Revisar Logs en Render

Si nada funciona:

1. Ve a tu dashboard de Render
2. Click en tu servicio "ProyectoRIFA"
3. Click en "Logs"
4. Busca errores rojos
5. Compárteme los errores que veas

## 📋 Variables de Entorno Requeridas

Asegúrate de tener estas variables en Render:

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=tu-secreto-aqui
NEXTAUTH_URL=https://tu-app.onrender.com

NEXT_PUBLIC_TICKET_PRICE=50
NEXT_PUBLIC_DRAW_DATE=2026-01-06T18:00:00
NEXT_PUBLIC_RAFFLE_NAME=Rifa Altruista
NEXT_PUBLIC_RAFFLE_CAUSE=Apoyo a damnificados
NEXT_PUBLIC_RAFFLE_PRIZE=Playstation 5

EMAIL_FROM=noreply@tudominio.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
```

## 🎯 Después de Inicializar

Una vez inicializada la base de datos:

1. ✅ La página principal cargará correctamente
2. ✅ Podrás hacer login con:
   - Email: `admin@rifaaltruista.com`
   - Password: `admin123456`
3. ✅ Los 500 boletos estarán disponibles
4. ✅ Puedes cargar tus ventas físicas

## 🔄 Si Ya Corriste el Script de Ventas

Si ya cargaste los 101 boletos vendidos localmente, **NO** es necesario volver a cargarlos. La base de datos de Render es diferente a la local.

Para cargar las ventas en Render:

1. Conéctate a tu base de datos de Render
2. O usa el endpoint que creamos (requiere implementación)

## ❓ ¿Sigue sin funcionar?

Compárteme:
1. La URL de tu app en Render
2. Captura de los logs de Render
3. Captura del error que ves

---

💡 **Tip**: El primer deploy puede tardar 5-10 minutos. Asegúrate de que el deploy haya terminado antes de intentar acceder.

