# 🔐 Guía: Cambiar Contraseña de Administrador

## 🚀 Cambiar Contraseña Sin Redesplegar

Este script te permite cambiar la contraseña de cualquier administrador **sin necesidad de subir cambios a GitHub ni redesplegar en Render**.

---

## 📋 Uso del Script

### En tu computadora local:

```bash
npm run cambiar-pass
```

### En Render (Shell):

```bash
npm run cambiar-pass
```

---

## 🎯 Ejemplo de Uso

### Paso 1: Ejecutar el script

```bash
npm run cambiar-pass
```

### Paso 2: Seguir las instrucciones

```
🔐 Cambiar contraseña de usuario administrador

Email del administrador (ej: admin@rifaaltruista.com): admin@rifaaltruista.com

✅ Usuario encontrado:
👤 Nombre: Admin Principal
📧 Email: admin@rifaaltruista.com
🔑 Rol: ADMIN

Nueva contraseña: MiNuevaContraseña2024!
Confirma la nueva contraseña: MiNuevaContraseña2024!

✅ ¡Contraseña actualizada exitosamente!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:            admin@rifaaltruista.com
🔒 Nueva contraseña: MiNuevaContraseña2024!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Inicia sesión en:
   Local:      http://localhost:3000/auth/login
   Producción: https://tu-dominio.onrender.com/auth/login
```

---

## 🎯 Caso de Uso: Cambiar Contraseña de admin@rifaaltruista.com

### Opción 1: En Render (Recomendado)

1. **Ve al Dashboard de Render:**
   - https://dashboard.render.com

2. **Selecciona tu servicio**

3. **Abre el Shell:**
   - Clic en la pestaña "Shell"

4. **Ejecuta el comando:**
   ```bash
   npm run cambiar-pass
   ```

5. **Ingresa los datos:**
   - Email: `admin@rifaaltruista.com`
   - Nueva contraseña: La que desees
   - Confirma la contraseña

6. **¡Listo!**
   - La contraseña se cambió instantáneamente
   - Puedes iniciar sesión con la nueva contraseña

### Opción 2: En tu computadora local

```bash
npm run cambiar-pass
```

**Nota:** Esto cambiará la contraseña en tu base de datos local, no en producción.

---

## 🔒 Recomendaciones para Contraseñas Seguras

✅ **Mínimo 12 caracteres**
✅ **Incluye mayúsculas y minúsculas**
✅ **Incluye números**
✅ **Incluye símbolos especiales** (!@#$%^&*)
✅ **No uses palabras del diccionario**
✅ **No uses información personal**

### Ejemplos de contraseñas seguras:

```
Admin2024!Seguro#Rifa$
MiPassw0rd!Fuerte2024
Segur1dad$Total%2024!
Contr@seña#Fuerte2024
```

---

## ✅ Ventajas de Este Script

1. **No requiere redespliegue** - Cambios instantáneos
2. **Funciona en local y producción** - Mismo script para ambos
3. **Seguro** - Hash bcrypt con salt
4. **Interactivo** - Te pregunta todo paso a paso
5. **Validación** - Confirma la contraseña antes de cambiarla
6. **Sin riesgos** - No afecta otros datos del usuario

---

## 🔧 Solución de Problemas

### Error: "No existe un usuario con ese email"

**Causa:** El email no está registrado en la base de datos

**Solución:**
1. Verifica que escribiste el email correctamente
2. Los emails se guardan en minúsculas
3. Lista los usuarios disponibles en el panel de administración

### Error: "Las contraseñas no coinciden"

**Causa:** La contraseña y su confirmación no son iguales

**Solución:** Escribe la misma contraseña dos veces

### Error: "Cannot connect to database"

**Causa:** No hay conexión a la base de datos

**Solución:**
1. Verifica que la variable `DATABASE_URL` esté correcta
2. Verifica que la base de datos esté activa
3. En Render, espera a que el servicio esté completamente desplegado

---

## 📝 Usuarios Comunes

Si tienes estos usuarios en tu base de datos:

```
📧 admin@rifaaltruista.com (usuario original)
📧 superadmin@rifa.com (nuevo usuario seguro)
```

Puedes cambiar la contraseña de cualquiera de ellos con este script.

---

## 🎯 Diferencia con otros scripts

| Script | Función |
|--------|---------|
| `npm run crear-admin` | **Crea** un nuevo usuario admin con contraseña predefinida |
| `npm run cambiar-pass` | **Cambia** la contraseña de un usuario existente |

---

## 📊 Flujo del Script

```
1. Solicita email del usuario
   ↓
2. Busca el usuario en la BD
   ↓
3. Muestra información del usuario
   ↓
4. Solicita nueva contraseña
   ↓
5. Solicita confirmación de contraseña
   ↓
6. Valida que coincidan
   ↓
7. Genera hash de la contraseña
   ↓
8. Actualiza la BD
   ↓
9. Confirma el cambio
```

---

## 💡 Casos de Uso

### Caso 1: Olvidaste tu contraseña

```bash
npm run cambiar-pass
```

Ingresa tu email y crea una nueva contraseña.

### Caso 2: Contraseña comprometida

Si sospechas que tu contraseña fue expuesta:

```bash
npm run cambiar-pass
```

Cambia inmediatamente a una contraseña nueva y segura.

### Caso 3: Rotación de contraseñas

Como buena práctica de seguridad, cambia las contraseñas periódicamente:

```bash
npm run cambiar-pass
```

### Caso 4: Múltiples administradores

Si tienes varios admins, puedes cambiar la contraseña de cualquiera:

```bash
npm run cambiar-pass
```

Solo necesitas el email del administrador.

---

## 🔐 Seguridad

✅ **Las contraseñas se almacenan con hash bcrypt**
✅ **No se guarda la contraseña en texto plano**
✅ **El script solicita confirmación**
✅ **Advierte si la contraseña es débil**
✅ **No se sube a GitHub** (solo el código del script)

---

## 📞 Comandos Disponibles

```bash
# Crear nuevo administrador con contraseña predefinida
npm run crear-admin

# Cambiar contraseña de administrador existente
npm run cambiar-pass

# Ver usuarios (en el panel de administración web)
```

---

## ✅ Resumen Rápido

**Para cambiar la contraseña de admin@rifaaltruista.com:**

1. Abre el Shell de Render (o terminal local)
2. Ejecuta: `npm run cambiar-pass`
3. Email: `admin@rifaaltruista.com`
4. Nueva contraseña: La que desees
5. Confirma la contraseña
6. ¡Listo! Inicia sesión con la nueva contraseña

**No necesitas:**
- ❌ Subir cambios a GitHub
- ❌ Redesplegar en Render
- ❌ Esperar tiempos de build
- ❌ Modificar código

**El cambio es instantáneo** ⚡

---

**Creado:** 23 de Diciembre de 2025

