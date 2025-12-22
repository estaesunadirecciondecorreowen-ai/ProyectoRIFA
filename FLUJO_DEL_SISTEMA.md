# 🔄 Flujo del Sistema - Rifa Altruista

Documentación técnica del flujo de estados y reglas de negocio.

## 📊 Estados del Sistema

### Estados de Boletos (Ticket)

| Estado | Descripción | Color UI | ¿Seleccionable? |
|--------|-------------|----------|-----------------|
| `available` | Boleto disponible para compra | 🟢 Verde | Sí |
| `reserved_pending_payment` | Reservado temporalmente (20 min) | ⚪ Gris | No |
| `pending_review` | Con transferencia esperando validación | 🟡 Amarillo | No |
| `sold` | Vendido y confirmado (transferencia) | 🔴 Rojo | No |
| `sold_physical` | Vendido físicamente (efectivo) | 🔴 Rojo | No |
| `cancelled` | Transferencia rechazada o expirada | ⚫ Gris oscuro | No |

### Estados de Compras (Purchase)

| Estado | Descripción | Siguiente paso |
|--------|-------------|----------------|
| `pending` | Compra creada, esperando pago | Usuario debe subir comprobante |
| `pending_review` | Comprobante subido, esperando admin | Admin debe validar |
| `approved` | Compra confirmada por admin | Final (exitoso) |
| `rejected` | Compra rechazada por admin | Final (fallido) |
| `cancelled` | Compra cancelada (timeout) | Final (fallido) |

### Estados de Transferencias (Transfer)

| Estado | Descripción |
|--------|-------------|
| `pending_review` | Esperando validación de admin |
| `approved` | Validada por admin |
| `rejected` | Rechazada por admin |

## 🔄 Flujos de Proceso

### Flujo 1: Compra Normal (Usuario → Transferencia → Validación)

```
[1] Usuario selecciona boletos
     ↓
[2] Sistema reserva temporalmente
     • Estado boleto: available → reserved_pending_payment
     • Estado compra: pending
     • Timeout: 20 minutos
     • Genera: unique_code (RIFA-XXXXX)
     ↓
[3] Usuario sube comprobante de transferencia
     • Estado boleto: reserved_pending_payment → pending_review
     • Estado compra: pending → pending_review
     • Estado transfer: pending_review
     • Email: "Transferencia recibida"
     ↓
[4a] Admin APRUEBA
     • Estado boleto: pending_review → sold
     • Estado compra: pending_review → approved
     • Estado transfer: pending_review → approved
     • Email: "¡Tu compra ha sido confirmada!"
     • Log: admin_log (action: approve_transfer)
     ↓
[FIN EXITOSO]

[4b] Admin RECHAZA
     • Estado boleto: pending_review → available
     • Estado compra: pending_review → rejected
     • Estado transfer: pending_review → rejected
     • Email: "Transferencia no validada" + motivo
     • Log: admin_log (action: reject_transfer)
     ↓
[FIN FALLIDO]
```

### Flujo 2: Timeout de Reserva

```
[1] Usuario reserva boletos
     • Estado boleto: available → reserved_pending_payment
     • reserved_until: now + 20 minutos
     ↓
[2] Usuario NO sube comprobante a tiempo
     ↓
[3] Cron job de limpieza (cada petición a /api/tickets)
     • Detecta: reserved_until < now
     • Estado boleto: reserved_pending_payment → available
     • Estado compra: pending → cancelled
     • Libera: user_id = null, purchase_id = null
     ↓
[FIN - Boletos liberados]
```

### Flujo 3: Venta Física (Admin)

```
[1] Admin accede a "Ventas Físicas"
     ↓
[2] Admin selecciona boletos disponibles
     ↓
[3] Admin ingresa datos del comprador
     • Nombre (obligatorio)
     • Email (opcional)
     • Notas (opcional)
     ↓
[4] Sistema registra venta
     • Estado boleto: available → sold_physical
     • Estado compra: approved (inmediato)
     • Method: "fisico"
     • Genera: unique_code
     • Si hay email: se crea/busca usuario
     • Log: admin_log (action: physical_sale)
     ↓
[FIN EXITOSO]
```

## 🔐 Reglas de Negocio

### Regla 1: Un Boleto, Un Dueño

- Un boleto NO puede estar asignado a dos compras simultáneamente
- Validación: El sistema verifica en tiempo real antes de reservar
- Si alguien más toma el boleto primero, se muestra error

### Regla 2: Reserva Temporal

- Duración: 20 minutos desde la reserva
- Propósito: Evitar que usuarios monopolicen boletos sin pagar
- Limpieza: Automática en cada llamada a `/api/tickets`

### Regla 3: Folio Único

- No se permite registrar dos transferencias con el mismo folio
- Validación: Antes de crear el registro en BD
- Propósito: Evitar fraude / duplicados

### Regla 4: Hash de Comprobante

- Cada archivo subido se hashea (SHA-256)
- No se permite subir el mismo comprobante dos veces
- Propósito: Detectar intentos de usar el mismo comprobante en múltiples compras

### Regla 5: Validación de Monto

- El monto transferido debe ser ≥ total de la compra
- Se acepta si pagan de más (propina)
- Se rechaza si pagan menos

### Regla 6: Email Verificado

- NO se puede comprar boletos sin verificar el email
- Validación: Middleware en `/api/tickets/reserve`
- Propósito: Evitar boletos "fantasma" de cuentas falsas

### Regla 7: Solo Admin Valida

- Los boletos NO pasan a "sold" automáticamente
- Requiere aprobación manual del administrador
- Excepción: Ventas físicas (admin las crea directamente como aprobadas)

### Regla 8: Rechazo Requiere Motivo

- Si admin rechaza una transferencia, DEBE proporcionar un motivo
- El motivo se envía al usuario por email
- Se registra en admin_logs para auditoría

### Regla 9: Estados Unidireccionales (Purchase)

```
pending → pending_review → approved (FINAL)
                        ↘ rejected (FINAL)
pending → cancelled (FINAL)
```

No se puede "desaprobar" una compra aprobada (solo desde BD directamente)

### Regla 10: Boletos Cancelados se Liberan

```
Si compra es rejected o cancelled:
  → Boletos vuelven a "available"
  → user_id = null
  → purchase_id = null
  → reserved_until = null
```

## 🔄 Diagrama de Estados (Boleto)

```
         ┌─────────────┐
         │  available  │ ←──────────────┐
         └──────┬──────┘                │
                │ Usuario reserva        │ Timeout
                ↓                        │ o Rechazo
    ┌───────────────────────────┐       │
    │ reserved_pending_payment  │───────┘
    └───────────┬───────────────┘
                │ Usuario sube comprobante
                ↓
        ┌──────────────────┐
        │  pending_review  │
        └────┬─────────┬───┘
             │         │
    Admin    │         │    Admin
    aprueba  │         │    rechaza
             ↓         ↓
         ┌──────┐  ┌───────────┐
         │ sold │  │ cancelled │ → available
         └──────┘  └───────────┘
             ↑
             │ Venta física
             │
    ┌────────────────┐
    │ sold_physical  │
    └────────────────┘
```

## 📧 Sistema de Notificaciones

| Evento | Destinatario | Plantilla | Cuándo |
|--------|--------------|-----------|--------|
| Registro | Usuario | `getVerificationEmailHtml` | Al crear cuenta |
| Transferencia recibida | Usuario | `getTransferReceivedEmailHtml` | Al subir comprobante |
| Compra aprobada | Usuario | `getTicketConfirmationEmailHtml` | Admin aprueba |
| Compra rechazada | Usuario | `getTransferRejectedEmailHtml` | Admin rechaza |
| Recuperar contraseña | Usuario | `getPasswordResetEmailHtml` | Usuario solicita |

## 🔍 Sistema de Auditoría

Todas las acciones administrativas se registran en `AdminLog`:

```typescript
{
  admin_id: string,      // Quién hizo la acción
  action: string,        // Tipo de acción
  payload: string,       // Datos relevantes (JSON)
  created_at: DateTime   // Cuándo
}
```

### Acciones Registradas

| Action | Descripción | Payload |
|--------|-------------|---------|
| `approve_transfer` | Admin aprobó una transferencia | transferId, purchaseId, tickets[] |
| `reject_transfer` | Admin rechazó una transferencia | transferId, purchaseId, reason |
| `physical_sale` | Admin registró venta física | purchaseId, tickets[], buyerName, buyerEmail |

## 🚨 Manejo de Errores

### Error: Boleto ya no disponible

```typescript
// Al intentar reservar un boleto que otro usuario tomó
{
  error: "Algunos boletos ya no están disponibles",
  unavailableTickets: [123, 456]
}
```

**Qué hacer:** Frontend debe refrescar el grid y que el usuario elija otros

### Error: Folio duplicado

```typescript
{
  error: "Este folio ya fue registrado"
}
```

**Qué hacer:** Usuario debe verificar que ingresó el folio correcto

### Error: Comprobante duplicado

```typescript
{
  error: "Este comprobante ya fue registrado"
}
```

**Qué hacer:** Usuario intentó usar el mismo comprobante dos veces - contactar soporte

### Error: Email no verificado

```typescript
{
  error: "Debes verificar tu correo electrónico antes de comprar boletos"
}
```

**Qué hacer:** Redirigir a página de verificación

## 📊 Queries Importantes

### Limpiar Reservas Expiradas

```typescript
await prisma.ticket.updateMany({
  where: {
    estado: 'reserved_pending_payment',
    reserved_until: { lt: new Date() }
  },
  data: {
    estado: 'available',
    user_id: null,
    purchase_id: null,
    reserved_until: null
  }
});
```

Ejecutado: En cada llamada a `/api/tickets`

### Obtener Estadísticas

```typescript
const stats = await prisma.ticket.groupBy({
  by: ['estado'],
  _count: true
});
```

Devuelve: Conteo por cada estado

### Buscar Transferencias Pendientes

```typescript
const pending = await prisma.transfer.findMany({
  where: { status: 'pending_review' },
  include: {
    purchase: {
      include: { user: true, tickets: true }
    }
  }
});
```

## 🔧 Mantenimiento

### Tarea Diaria

1. Revisar y validar transferencias pendientes
2. Verificar que no haya reservas "atoradas" (normalmente se limpian solas)

### Tarea Semanal

1. Backup de la base de datos
2. Revisar logs de errores
3. Verificar envío de emails

### Tarea Mensual

1. Analizar estadísticas de conversión
2. Optimizar queries lentas (si las hay)
3. Limpiar archivos de comprobantes antiguos (opcional)

## 🚀 Optimizaciones

### Índices de Base de Datos

Ya incluidos en `schema.prisma`:

- `tickets`: numero, estado
- `purchases`: user_id, status, unique_code
- `transfers`: folio, status
- `users`: email

### Caching

Actualmente no implementado, pero se podría:

- Cachear el grid de tickets (actualizar cada 10s)
- Cachear estadísticas del dashboard admin (actualizar cada 30s)

### Escalabilidad

Para > 10,000 boletos:

1. Implementar paginación en el grid
2. Usar WebSockets para actualizaciones en tiempo real
3. Separar el procesamiento de emails en cola (Bull/BullMQ)
4. Considerar CDN para comprobantes

---

Este documento es técnico y está dirigido a desarrolladores que mantengan o extiendan el sistema.


