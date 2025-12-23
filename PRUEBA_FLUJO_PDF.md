# 📋 Instrucciones para Probar el Flujo de PDFs

## 🎯 Objetivo
Probar el flujo completo de generación y descarga de PDFs de boletos.

## ✅ Pre-requisitos
1. El servidor debe estar corriendo (`npm run dev`)
2. Debes tener una cuenta de admin (admin@rifa.com / Admin123!)
3. Debe haber al menos un boleto vendido (estado `sold` o `sold_physical`)

## 🔄 Flujo Completo de Prueba

### Paso 1: Crear una Compra de Prueba
1. Inicia sesión como usuario normal (o crea uno nuevo)
2. Ve a `/comprar` y selecciona uno o más boletos
3. Reserva los boletos y sube un comprobante de pago

### Paso 2: Aprobar la Compra (como Admin)
1. Cierra sesión e inicia sesión como admin (`admin@rifa.com` / `Admin123!`)
2. Ve a `/admin/transfers`
3. Aprueba la transferencia de la compra de prueba
4. Los boletos ahora deberían estar en estado `sold`

### Paso 3: Generar PDFs (como Admin)
1. Ve a `/admin`
2. En la sección "📄 Generar PDFs de Boletos":
   - Ingresa los números de los boletos vendidos (ej: `2`)
   - Selecciona la plantilla (negro, por defecto)
   - Haz clic en "📄 Generar PDFs"
3. Deberías ver un mensaje de éxito con el nombre del archivo ZIP generado
4. **Abre la consola del navegador (F12)** para ver los logs:
   - `🔗 Llamando a API externa`
   - `📊 Status de API externa: 200 OK`
   - `✅ API Response`
   - `📥 Descargando ZIP de`
   - `📊 Status de descarga: 200 OK`
   - `💾 ZIP descargado, tamaño: X bytes`
   - `ZIP guardado exitosamente en: C:\Proyecto\ProyectoAltruista\tickets_pdf\boletos_XXXXXXXXXX.zip`

### Paso 4: Verificar que el Archivo se Guardó
1. Abre la carpeta del proyecto en el Explorador de Windows
2. Ve a la carpeta `tickets_pdf`
3. Deberías ver un archivo llamado `boletos_XXXXXXXXXX.zip` (donde XXXXXXXXXX es un timestamp)
4. Puedes descomprimir el ZIP para ver los PDFs de los boletos

### Paso 5: Descargar PDFs (como Usuario)
1. Cierra sesión del admin e inicia sesión con el usuario que hizo la compra
2. Ve a `/dashboard`
3. Deberías ver la compra aprobada con:
   - ✅ "Tus boletos están listos para descargar"
   - 📁 El nombre del archivo ZIP
   - Un botón verde "📥 Descargar mis Boletos en PDF"
4. **Abre la consola del navegador (F12)**
5. Haz clic en el botón "📥 Descargar mis Boletos en PDF"
6. En la consola, deberías ver:
   - `🔗 Intentando descargar desde: /api/user/download-tickets?purchaseId=XXXXXX`
7. Se abrirá una nueva pestaña y el archivo ZIP debería descargarse automáticamente

## 🔍 Verificar Logs del Servidor

Mientras haces las pruebas, mantén la terminal abierta donde corre el servidor (`npm run dev`) y observa los logs:

### Durante la Generación de PDFs:
```
🔗 Llamando a API externa: https://tickets-fqbvdgbeewbedkfs.centralus-01.azurewebsites.net/ticket?numbers=2&template=negro&associate=true
📊 Status de API externa: 200 OK
✅ API Response: { "tickets": ["ticket_2.pdf"] }
📥 Descargando ZIP de: https://tickets-fqbvdgbeewbedkfs.centralus-01.azurewebsites.net/download?files=ticket_2.pdf
📊 Status de descarga: 200 OK
📋 Content-Type de respuesta: application/zip
💾 ZIP descargado, tamaño: XXXX bytes
ZIP guardado exitosamente en: C:\Proyecto\ProyectoAltruista\tickets_pdf\boletos_1234567890.zip
```

### Durante la Descarga del Usuario:
```
📂 Directorio de trabajo: C:\Proyecto\ProyectoAltruista
📁 Buscando ZIP en: C:\Proyecto\ProyectoAltruista\tickets_pdf\boletos_1234567890.zip
✅ Archivo existe: true
✅ ZIP leído exitosamente, tamaño: XXXX bytes
```

## ❌ Problemas Comunes y Soluciones

### Error: "Archivo no encontrado"
- **Causa**: El archivo ZIP no se guardó correctamente o el nombre no coincide
- **Solución**: 
  1. Verifica que la carpeta `tickets_pdf` existe en la raíz del proyecto
  2. Verifica los logs del servidor para ver si el archivo se guardó correctamente
  3. Verifica que los tickets tengan el campo `pdf_filename` actualizado en la base de datos

### Error: "Los PDFs aún no han sido generados"
- **Causa**: El campo `pdf_generado` de los tickets no está en `true`
- **Solución**: Regenera los PDFs desde el panel de admin

### Error de la API externa
- **Causa**: La API externa de generación de PDFs no responde o devuelve un error
- **Solución**: 
  1. Verifica que la API esté disponible
  2. Verifica que los números de boletos sean válidos
  3. Revisa los logs del servidor para ver el error específico

### El botón de descarga no aparece
- **Causa**: La compra no está aprobada o los PDFs no se han generado
- **Solución**:
  1. Verifica que la compra esté en estado `approved`
  2. Verifica que al menos un ticket tenga `pdf_generado = true`
  3. Regenera los PDFs si es necesario

## 🧹 Limpiar Datos de Prueba

Si quieres limpiar todas las compras de prueba y resetear los boletos:

```powershell
cd C:\Proyecto\ProyectoAltruista
npm run tsx scripts/limpiar-compras.ts
```

Esto eliminará:
- Todas las transferencias
- Todas las compras
- Reseteará todos los boletos a estado `available`
- **NO** borrará los archivos ZIP de la carpeta `tickets_pdf`

Para borrar los archivos ZIP manualmente:
```powershell
Remove-Item C:\Proyecto\ProyectoAltruista\tickets_pdf\*.zip
```

## 📝 Notas Importantes

1. **Los PDFs se generan mediante una API externa**: La aplicación llama a una API de Azure para generar los PDFs de los boletos.
2. **Los archivos se guardan en el servidor**: Los archivos ZIP se guardan en la carpeta `tickets_pdf` del proyecto.
3. **Un ZIP por compra**: Todos los boletos de una compra comparten el mismo archivo ZIP.
4. **Los usuarios solo pueden descargar sus propios boletos**: La API verifica que el usuario sea el dueño de la compra.
5. **Los admins pueden regenerar PDFs**: Si hay un problema, los admins pueden regenerar los PDFs desde el panel de administración.

## 🚀 Siguiente Paso

Una vez que el flujo funcione correctamente en local, puedes desplegarlo a producción. Asegúrate de:
1. La carpeta `tickets_pdf` debe ser persistente en el servidor de producción
2. Configurar las variables de entorno correctamente
3. Probar el flujo completo en producción antes de anunciar la funcionalidad a los usuarios

