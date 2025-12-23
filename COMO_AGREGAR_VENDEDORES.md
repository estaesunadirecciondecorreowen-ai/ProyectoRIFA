# 📘 Guía: Cómo Agregar Nuevos Vendedores y Boletos

## 🎯 Archivo a Editar

**Ubicación**: `scripts/cargar-ventas-fisicas-v2.ts`

Este script está organizado por vendedor para facilitar la gestión y agregar nuevas ventas.

## 📝 Cómo Agregar un Nuevo Vendedor

### Paso 1: Abrir el archivo

Abre `scripts/cargar-ventas-fisicas-v2.ts` en tu editor.

### Paso 2: Buscar la sección de vendedores

Busca la constante `ventasPorVendedor` (línea ~15). Verás algo así:

```typescript
const ventasPorVendedor: VendedorVentas[] = [
  {
    vendedor: 'Mauricio',
    ventas: [
      { boleto: 184, comprador: 'Emiliano' },
      { boleto: 6, comprador: 'Valeria O.' },
      // ... más ventas
    ],
  },
  // ... más vendedores
];
```

### Paso 3: Agregar tu nuevo vendedor

Al final de la lista (pero **ANTES** del corchete de cierre `]`), agrega:

```typescript
  {
    vendedor: 'Nombre del Nuevo Vendedor',
    ventas: [
      { boleto: 999, comprador: 'Comprador 1' },
      { boleto: 888, comprador: 'Comprador 2' },
      { boleto: 777, comprador: 'Comprador 3' },
    ],
  },
```

**⚠️ IMPORTANTE**: 
- Asegúrate de poner una **coma** después del último vendedor anterior
- Los números de boleto deben estar disponibles (no vendidos)
- Los nombres de compradores deben ser exactos

## 📋 Ejemplo Completo

```typescript
const ventasPorVendedor: VendedorVentas[] = [
  {
    vendedor: 'Mauricio',
    ventas: [
      { boleto: 184, comprador: 'Emiliano' },
      { boleto: 6, comprador: 'Valeria O.' },
    ],
  },
  {
    vendedor: 'Rebeca',
    ventas: [
      { boleto: 56, comprador: 'Mateo C.' },
    ],
  },
  // ⭐ NUEVO VENDEDOR AGREGADO AQUÍ
  {
    vendedor: 'María García',
    ventas: [
      { boleto: 150, comprador: 'Juan Pérez' },
      { boleto: 151, comprador: 'Ana López' },
      { boleto: 152, comprador: 'Carlos Martínez' },
    ],
  },
];
```

## 🚀 Ejecutar el Script

### Opción 1: Cargar TODAS las ventas

```bash
npm run cargar-ventas
```

Esto cargará TODOS los vendedores y sus boletos. Los boletos ya vendidos serán omitidos automáticamente.

### Opción 2: Limpiar y recargar TODO

Si necesitas empezar de cero:

```bash
# 1. Limpiar todas las ventas
npm run limpiar-ventas

# 2. Cargar todo de nuevo
npm run cargar-ventas
```

## 📊 Resumen Actual de Vendedores

| Vendedor | Boletos Vendidos |
|----------|------------------|
| Mauricio | 11 boletos |
| Rebeca | 18 boletos |
| Antonio | 8 boletos |
| Ricardo | 16 boletos |
| Diego R. | 4 boletos |
| Cristopher D. | 14 boletos |
| Leonardo MG | 19 boletos |
| Karina Ramirez | 11 boletos |
| **TOTAL** | **101 boletos** |

## ⚠️ Datos que SIEMPRE se marcan como "Pendiente"

El script marca automáticamente el teléfono como `"Pendiente"` para todos los boletos. 

**Esto es intencional** para que puedas identificar qué datos necesitan ser actualizados posteriormente.

## 🔍 Verificar los Resultados

Después de ejecutar el script, verás:

1. **Resumen por vendedor**: Cuántos boletos se registraron para cada uno
2. **Total de boletos**: Debe coincidir con tu lista
3. **Boletos omitidos**: Si algún boleto ya estaba vendido, aparecerá aquí

## 💡 Consejos

1. **Verifica los números de boleto**: Asegúrate de que sean correctos antes de ejecutar
2. **Nombres exactos**: Escribe los nombres de compradores tal como quieres que aparezcan
3. **Backup**: Si tienes dudas, primero haz `npm run limpiar-ventas` para limpiar
4. **Teléfonos**: Actualízalos después desde el panel de administrador

## 🆘 ¿Problemas?

### El boleto ya está vendido
- **Solución**: El script lo omitirá automáticamente y mostrará un mensaje

### Error de sintaxis
- **Solución**: Verifica que todas las comas estén correctas
- Cada entrada de venta debe terminar con coma (excepto la última)
- Cada vendedor debe terminar con coma (excepto el último)

### No aparecen los boletos
- **Solución**: Revisa que el número de boleto exista (1-500)
- Verifica que el script terminó sin errores

## 📁 Archivos Relacionados

- **Script principal**: `scripts/cargar-ventas-fisicas-v2.ts`
- **Script de limpieza**: `scripts/limpiar-compras.ts`
- **Comandos**: Definidos en `package.json`

---

✨ **Última actualización**: Diciembre 2024  
📊 **Total de boletos cargados**: 101 de 500

