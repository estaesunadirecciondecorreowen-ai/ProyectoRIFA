# 🔐 Credenciales de Administrador

## ✅ Usuario Administrador Creado

Se ha creado exitosamente un usuario administrador con las siguientes credenciales:

### 📋 Credenciales de Acceso

```
📧 Email:      admin@rifa.com
🔓 Contraseña: Admin123!
👤 Nombre:     Administrador
🔑 Rol:        ADMINISTRADOR
```

## 🌐 Iniciar Sesión

1. **URL de Login:** http://localhost:3000/auth/login
2. Ingresa el email: `admin@rifa.com`
3. Ingresa la contraseña: `Admin123!`
4. Click en "Iniciar Sesión"

## 🎛️ Panel de Administración

Una vez que inicies sesión, tendrás acceso a:

### Rutas de Administrador

| Ruta | Descripción |
|------|-------------|
| `/admin` | Panel principal de administración |
| `/admin/transfers` | Validar transferencias bancarias |
| `/admin/physical-sales` | Registrar ventas físicas |

### Funcionalidades del Admin

- ✅ Ver estadísticas generales de la rifa
- ✅ Ver todos los boletos y su estado
- ✅ Aprobar/rechazar transferencias bancarias
- ✅ Registrar ventas físicas en efectivo
- ✅ Ver historial de todas las compras
- ✅ Descargar reportes en Excel
- ✅ Ver logs de auditoría

## 🔄 Crear Más Administradores

Si necesitas crear más usuarios administradores, ejecuta:

```powershell
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/crear-admin-rapido.ts
```

O para crear uno con datos personalizados, ejecuta:

```powershell
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/crear-admin.ts
```

Este último te pedirá los datos del nuevo administrador de forma interactiva.

## ⚠️ Seguridad

### Para Producción:

**IMPORTANTE:** Estas son credenciales de desarrollo. En producción:

1. Cambia la contraseña a una más segura
2. Considera usar autenticación de dos factores
3. No compartas estas credenciales públicamente
4. Usa contraseñas únicas y complejas

### Cambiar Contraseña

Para cambiar la contraseña de este usuario:

1. Ve a la base de datos con: `npx prisma studio`
2. Busca el usuario admin@rifa.com
3. Genera un nuevo hash con bcrypt
4. O crea un nuevo usuario y elimina el antiguo

## 📝 Notas

- ✅ El email del usuario está verificado automáticamente
- ✅ No necesita verificar su email para iniciar sesión
- ✅ Tiene permisos completos de administrador
- ✅ Puede acceder a todas las rutas protegidas

---

**Creado el:** 22 de Diciembre 2024  
**Usuario:** admin@rifa.com  
**Contraseña:** Admin123!

