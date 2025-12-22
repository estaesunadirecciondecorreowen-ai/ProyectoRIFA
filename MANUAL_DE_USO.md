# 📖 Manual de Uso - Sistema de Rifa Altruista

Guía completa para usar el sistema tanto como usuario final como administrador.

## 👤 Para Usuarios

### 1. Registro y Verificación

#### Crear una Cuenta

1. Ve a la página principal
2. Haz clic en **"Registrarse"**
3. Completa el formulario:
   - **Nombre completo** (requerido)
   - **Correo electrónico** (requerido)
   - **Teléfono** (opcional)
   - **Contraseña** (mínimo 6 caracteres)
   - **Confirmar contraseña**
4. Haz clic en **"Crear Cuenta"**

#### Verificar tu Email

1. Revisa tu correo (incluyendo spam)
2. Busca el email de "Verifica tu correo electrónico"
3. Haz clic en el botón **"Verificar mi correo"**
4. Serás redirigido y podrás iniciar sesión

⚠️ **No podrás comprar boletos hasta verificar tu email**

### 2. Comprar Boletos

#### Paso 1: Seleccionar Boletos

1. Inicia sesión
2. Ve a **"Comprar Boletos"**
3. Verás el grid de 500 boletos con colores:
   - 🟢 **Verde** = Disponible (puedes seleccionarlo)
   - 🟡 **Amarillo** = Pendiente de validación
   - 🔴 **Rojo** = Ya vendido
   - ⚪ **Gris** = Reservado temporalmente

4. Haz clic en los boletos verdes que quieras comprar
5. Los boletos seleccionados se marcarán con un ✓
6. Revisa el total a pagar
7. Haz clic en **"Reservar X boleto(s)"**

#### Paso 2: Realizar la Transferencia

Una vez reservados, tienes **20 minutos** para completar el pago. Después, los boletos se liberan automáticamente.

1. Verás los datos bancarios:
   - Banco
   - Número de cuenta
   - CLABE
   - Titular

2. **MUY IMPORTANTE:** En el concepto o referencia de tu transferencia, pon tu **código de compra** (ej: RIFA-ABC123)

3. Realiza la transferencia desde tu banco

#### Paso 3: Subir Comprobante

1. Una vez hecha la transferencia, completa el formulario:
   - **Folio/Referencia:** El número que te dio tu banco
   - **Monto:** La cantidad que transferiste (debe ser igual o mayor al total)
   - **Fecha:** Cuándo hiciste la transferencia
   - **Comprobante:** Sube una foto o PDF de tu comprobante

2. Haz clic en **"Enviar Comprobante"**

3. Recibirás un email confirmando que recibimos tu transferencia

#### Paso 4: Esperar Validación

- Tu compra queda como **"En revisión"**
- Tus boletos quedan reservados (nadie más puede tomarlos)
- El administrador validará tu transferencia (normalmente en 1-24 horas)
- Recibirás un email cuando sea aprobada o rechazada

### 3. Tu Dashboard

En tu panel personal puedes ver:

- **Boletos confirmados:** Los que ya fueron validados
- **En revisión:** Los que están esperando validación
- **Historial completo:** Todas tus compras

Cada compra muestra:
- Código único
- Boletos asignados
- Monto pagado
- Estado actual
- Información de la transferencia

### 4. ¿Qué pasa si mi transferencia es rechazada?

- Recibirás un email explicando el motivo
- Los boletos se liberan y vuelven a estar disponibles
- Puedes contactar al administrador si crees que hubo un error
- Puedes intentar comprar nuevamente

### 5. Recuperar Contraseña

Si olvidaste tu contraseña:

1. Ve a **"Iniciar Sesión"**
2. Haz clic en **"¿Olvidaste tu contraseña?"**
3. Ingresa tu email
4. Recibirás un link para crear una nueva contraseña
5. El link expira en 1 hora

---

## 👨‍💼 Para Administradores

### Acceso al Panel de Administración

1. Inicia sesión con tu cuenta de administrador
2. En la barra superior verás **"Panel Admin"**
3. Haz clic para acceder

### Dashboard Principal

El dashboard muestra:

- **Boletos vendidos:** Total y porcentaje
- **Pendientes:** Boletos esperando validación
- **Disponibles:** Boletos que aún pueden comprarse
- **Ingresos totales:** Suma de todas las ventas aprobadas
- **Usuarios registrados:** Total de usuarios en el sistema
- **Alertas:** Transferencias pendientes de validar
- **Ventas recientes:** Últimas 10 ventas aprobadas

### 1. Validar Transferencias

#### Ver Transferencias Pendientes

1. En el panel admin, haz clic en **"Validar Transferencias"**
2. Verás una lista con todas las transferencias pendientes

Cada transferencia muestra:

**Información de la Compra:**
- Código único
- Nombre y datos del usuario
- Boletos seleccionados
- Total esperado
- Fecha de compra

**Datos de la Transferencia:**
- Folio/Referencia
- Monto transferido
- Fecha de pago
- Link para ver el comprobante

#### Aprobar una Transferencia

1. Revisa el comprobante haciendo clic en **"Ver comprobante"**
2. Verifica que:
   - El monto coincida (o sea mayor) al total de la compra
   - El folio sea válido
   - La fecha tenga sentido
3. (Opcional) Añade notas en el campo de texto
4. Haz clic en **"✅ Aprobar Transferencia"**

Cuando apruebes:
- Los boletos pasan a estado **"Vendido"**
- El usuario recibe un email con sus números confirmados
- La compra se marca como aprobada
- Se actualiza el dashboard público
- Se registra en los logs

#### Rechazar una Transferencia

1. Revisa el comprobante
2. **Obligatorio:** Escribe el motivo del rechazo en las notas
   - Ejemplo: "El monto no coincide"
   - Ejemplo: "Comprobante ilegible"
   - Ejemplo: "No se encontró la transferencia en el banco"
3. Haz clic en **"❌ Rechazar Transferencia"**

Cuando rechaces:
- Los boletos se liberan (vuelven a disponibles)
- El usuario recibe un email con el motivo
- La compra se marca como rechazada

### 2. Registrar Ventas Físicas

Para registrar boletos vendidos en efectivo o fuera del sistema:

1. Ve a **"Ventas Físicas"**
2. Selecciona los boletos vendidos (haz clic en los verdes)
3. Completa el formulario:
   - **Nombre del comprador** (obligatorio)
   - **Email del comprador** (opcional, si se proporciona le llegará confirmación)
   - **Notas** (opcional, ej: "Venta en el evento del sábado")
4. Haz clic en **"💾 Registrar Venta Física"**

Los boletos quedarán marcados como **"Vendido (Físico)"** y se generará un código único de compra.

### 3. Estadísticas y Reportes

En el dashboard principal puedes ver:

- Progreso de ventas en tiempo real
- Tabla de ventas recientes con:
  - Código de compra
  - Nombre del usuario
  - Cantidad de boletos
  - Monto total
  - Método de pago
  - Fecha

### 4. Gestión de Usuarios

Aunque no hay una interfaz específica, puedes:

- Ver cuántos usuarios están registrados
- Revisar los datos de usuario en cada compra
- Usar Prisma Studio para administración avanzada:
  ```bash
  npx prisma studio
  ```

### 5. Mejores Prácticas

#### Validación de Transferencias

✅ **Haz:**
- Valida las transferencias lo más pronto posible (idealmente dentro de 24 horas)
- Verifica siempre el comprobante
- Si tienes dudas, contacta al usuario antes de rechazar
- Añade notas para mantener un registro

❌ **No hagas:**
- No apruebes sin revisar el comprobante
- No rechaces sin explicar el motivo
- No dejes transferencias pendientes por días

#### Seguridad

✅ **Haz:**
- Cambia la contraseña por defecto inmediatamente
- Usa una contraseña fuerte y única
- No compartas tus credenciales
- Cierra sesión en computadoras públicas

❌ **No hagas:**
- No uses "admin123456" en producción
- No dejes tu sesión abierta sin supervisión

#### Comunicación

✅ **Haz:**
- Responde rápido a los usuarios
- Sé claro en los motivos de rechazo
- Mantén un tono profesional y amable

### 6. Tareas Diarias Recomendadas

**Cada día:**
1. Revisa las transferencias pendientes
2. Valida o rechaza según corresponda
3. Revisa el dashboard para ver el progreso
4. Verifica que no haya problemas técnicos

**Cada semana:**
1. Exporta un respaldo de la base de datos
2. Revisa las estadísticas de ventas
3. Verifica el estado general del sistema

### 7. Solución de Problemas Comunes

#### Usuario no recibió el email de confirmación

**Solución:**
1. Verifica en Prisma Studio que el email se haya registrado
2. Revisa los logs del servidor
3. Confirma que el sistema de emails esté funcionando
4. Contacta al usuario y valida manualmente su cuenta si es necesario

#### Dos usuarios compraron el mismo boleto

**Solución:**
- Esto no debería pasar gracias al sistema de reservas
- Si pasa, revisa los timestamps en la base de datos
- Mantén la venta más antigua y contacta al otro usuario para ofrecerle otros boletos

#### Un comprobante no se puede abrir

**Solución:**
1. Intenta descargarlo directamente desde `/public/uploads/`
2. Contacta al usuario para que lo reenvíe
3. Si persiste, puedes registrar una venta física con sus datos

### 8. Logs y Auditoría

Todas las acciones administrativas se registran en la tabla `AdminLog`:

- Quién hizo la acción
- Qué acción realizó
- Cuándo la hizo
- Datos relevantes (JSON)

Puedes revisarlos en Prisma Studio para auditorías.

---

## 🆘 Preguntas Frecuentes

### Para Usuarios

**P: ¿Cuánto tiempo tengo para pagar?**
R: 20 minutos desde que reservas los boletos.

**P: ¿Puedo cambiar mis boletos después de comprar?**
R: No, una vez aprobada la compra, los boletos son finales.

**P: ¿Qué pasa si pago menos del monto total?**
R: Tu transferencia será rechazada. Debes pagar el monto exacto o más.

**P: ¿Cuándo sabré si gané?**
R: Después de la fecha del sorteo, todos los participantes serán notificados.

### Para Administradores

**P: ¿Puedo editar una compra ya aprobada?**
R: Sólo desde Prisma Studio. No se recomienda a menos que sea absolutamente necesario.

**P: ¿Cómo hago un backup?**
R: 
```bash
pg_dump -U postgres rifa_altruista > backup.sql
```

**P: ¿Puedo tener múltiples administradores?**
R: Sí, crea más usuarios con rol ADMIN desde Prisma Studio.

---

## 📞 Soporte

Si tienes dudas no resueltas en este manual:

1. Revisa el README.md técnico
2. Consulta INSTALACION.md si es un problema de instalación
3. Busca en los issues de GitHub
4. Abre un nuevo issue con tu pregunta

---

¡Gracias por usar el Sistema de Rifa Altruista! 🎫💚


