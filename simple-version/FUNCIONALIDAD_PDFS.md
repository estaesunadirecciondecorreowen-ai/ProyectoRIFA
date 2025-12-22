# 📄 Funcionalidad de Generación y Descarga de PDFs

## 🎯 Descripción General

Sistema integrado para generar y descargar boletos en formato PDF utilizando la API externa de generación de tickets. Los administradores pueden generar PDFs de boletos vendidos, y los usuarios pueden descargar sus boletos una vez aprobados y generados.

---

## 🔧 API Utilizada

**URL Base:** `https://tickets-fqbvdgbeewbedkfs.centralus-01.azurewebsites.net`

### Endpoints utilizados:

1. **Generar Tickets:** `/ticket`
   - Parámetros:
     - `numbers`: Lista de números separados por comas (ej: 1,2,3,4)
     - `template`: Color de plantilla ("gris" o "negro")
     - `associate`: Agrupación (true = 4 por hoja, false = individual)

2. **Descargar Tickets:** `/download`
   - Parámetro:
     - `files`: Lista de archivos PDF separados por comas

---

## 👑 Panel de Administración

### Acceso
- Ruta: `/admin`
- Usuario: `admin@rifa.com`
- Contraseña: `admin123`

### Nueva pestaña: "📄 Generar PDFs"

#### Características:
- **Selección de plantilla:** Gris o Negro
- **Opciones de agrupación:**
  - 4 boletos por hoja (recomendado para impresión)
  - Individual (un boleto por archivo)
- **Generación manual:** Ingresa números de boletos separados por coma
- **Generación automática:** Botón para generar PDFs de TODOS los boletos vendidos

#### Ejemplo de uso:
```
1. Seleccionar plantilla: Negro
2. Agrupación: 4 boletos por hoja
3. Ingresar números: 1, 5, 10, 25, 100
4. Clic en "Generar PDFs"
```

#### Validaciones:
- Solo se pueden generar PDFs de boletos con estado "vendido" o "fisico"
- Los números duplicados son ignorados
- Muestra errores si algún boleto no existe o no está vendido

---

## 👤 Dashboard del Usuario

### Descarga de Boletos

Los usuarios verán un botón de descarga en sus compras **solo si**:
1. La compra está **aprobada**
2. Los PDFs han sido **generados** por el administrador

### Estados posibles:
- **Compra aprobada CON PDFs generados:**
  ```
  📥 Descargar mis Boletos en PDF
  ```
  
- **Compra aprobada SIN PDFs generados:**
  ```
  ℹ️ Generando PDFs
  Los PDFs de tus boletos están siendo generados. Vuelve pronto para descargarlos.
  ```

- **Compra pendiente o rechazada:**
  - No se muestra opción de descarga

---

## 🗄️ Cambios en la Base de Datos

### Nueva tabla: `tickets_pdf/`
Carpeta donde se almacenan los archivos ZIP con los PDFs generados.

### Nuevas columnas en tabla `boletos`:
- `pdf_generado` (INTEGER): 0 = No generado, 1 = Generado
- `pdf_filename` (TEXT): Nombre del archivo ZIP que contiene el PDF

---

## 🔄 Flujo Completo

### Para el Administrador:
1. Revisar y aprobar transferencias
2. Ir a la pestaña "📄 Generar PDFs"
3. Seleccionar opciones de plantilla y agrupación
4. Ingresar números de boletos vendidos
5. Hacer clic en "Generar PDFs"
6. El sistema:
   - Llama a la API externa
   - Descarga los PDFs generados
   - Los guarda en `tickets_pdf/`
   - Marca los boletos como "PDF generado"

### Para el Usuario:
1. Comprar boletos y subir comprobante
2. Esperar aprobación del admin
3. Una vez aprobado, esperar que el admin genere los PDFs
4. Hacer clic en "📥 Descargar mis Boletos en PDF"
5. Recibir un archivo ZIP con todos sus boletos

---

## 📦 Instalación de Dependencias

Asegúrate de instalar la nueva dependencia:

```bash
pip install -r requirements.txt
```

Nueva dependencia agregada:
- `requests==2.31.0` (para comunicación con la API)

---

## 🔒 Seguridad

- Solo administradores pueden generar PDFs
- Los usuarios solo pueden descargar sus propios boletos
- Los archivos se guardan localmente en el servidor
- Los PDFs se agrupan por fecha de generación

---

## 📊 Endpoints de API Agregados

### 1. Generar PDFs (Admin)
```
POST /api/admin/generar-pdfs
Content-Type: application/json

{
  "boletos": [1, 2, 3, 4],
  "template": "negro",
  "associate": true
}

Respuesta exitosa:
{
  "success": true,
  "message": "PDFs generados correctamente para 4 boleto(s)",
  "filename": "boletos_20251222_120000.zip",
  "boletos": [1, 2, 3, 4]
}
```

### 2. Descargar Boletos (Usuario)
```
GET /api/descargar-boletos

Respuesta: Archivo ZIP con los PDFs de los boletos del usuario
```

---

## 🎨 Opciones de Plantilla

### Plantilla Gris (predeterminada)
- Diseño con fondo gris suave
- Ideal para impresión económica

### Plantilla Negro
- Diseño con fondo negro
- Mayor contraste visual
- Más elegante

---

## 📝 Notas Importantes

1. **Tiempo de generación:** La generación de PDFs puede tardar varios segundos dependiendo de la cantidad de boletos
2. **Almacenamiento:** Los archivos ZIP se guardan en `simple-version/tickets_pdf/`
3. **Límites:** No hay límite en la cantidad de boletos a generar, pero se recomienda hacerlo en lotes
4. **Re-generación:** Se puede generar el PDF del mismo boleto múltiples veces (actualiza el archivo)

---

## 🐛 Solución de Problemas

### Error: "Error en la API de tickets"
- Verificar conexión a internet
- Comprobar que la API externa esté disponible
- Revisar los logs del servidor

### Error: "El boleto X no está vendido"
- Verificar que el boleto esté en estado "vendido" o "fisico"
- Aprobar la transferencia antes de generar PDFs

### El usuario no ve el botón de descarga
- Verificar que la compra esté aprobada
- Generar los PDFs desde el panel de administración
- Refrescar la página del dashboard

---

## 📞 Contacto y Soporte

Para reportar problemas o sugerencias con esta funcionalidad, contacta al administrador del sistema.

---

**Fecha de implementación:** Diciembre 2025
**Versión:** 1.0

