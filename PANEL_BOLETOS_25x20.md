# 🎯 Panel de Boletos 25x20 - Guía Visual

## 📐 Estructura del Panel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Panel de Boletos (25 x 20)                         │
│                          Total: 500 boletos                             │
├─────────────────────────────────────────────────────────────────────────┤
│  1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17 ... │
│ 26  27  28  29  30  31  32  33  34  35  36  37  38  39  40  41  42 ... │
│ 51  52  53  54  55  56  57  58  59  60  61  62  63  64  65  66  67 ... │
│ 76  77  78  79  80  81  82  83  84  85  86  87  88  89  90  91  92 ... │
│101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 ... │
│126 127 128 129 130 131 132 133 134 135 136 137 138 139 140 141 142 ... │
│                            ... (20 filas)                               │
│451 452 453 454 455 456 457 458 459 460 461 462 463 464 465 466 467 ... │
│476 477 478 479 480 481 482 483 484 485 486 487 488 489 490 491 492 ... │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📊 Distribución de Boletos

- **Columnas:** 25 (horizontal)
- **Filas:** 20 (vertical)
- **Total:** 500 boletos numerados del 1 al 500

### Cálculo de posición:
- Fila 1: Boletos 1-25
- Fila 2: Boletos 26-50
- Fila 3: Boletos 51-75
- ...
- Fila 20: Boletos 476-500

## 🎨 Leyenda de Colores

### Estado de Boletos:

```
┌──────────┬─────────────────────┬──────────────────────────────┐
│  Color   │       Estado        │         Descripción          │
├──────────┼─────────────────────┼──────────────────────────────┤
│   🟢     │    DISPONIBLE       │  Puede ser comprado          │
│   🔴     │     VENDIDO         │  Ya fue comprado y validado  │
│   🟡     │    PENDIENTE        │  Esperando validación        │
│   🟣     │  VENTA FÍSICA       │  Vendido presencialmente     │
│   ⚪     │    RESERVADO        │  Reservado temporalmente     │
└──────────┴─────────────────────┴──────────────────────────────┘
```

## 💻 Implementación Técnica

### CSS (Versión Simple):
```css
.tickets-grid {
    display: grid;
    grid-template-columns: repeat(25, minmax(45px, 1fr));
    gap: 0.25rem;
    overflow-x: auto;
}
```

### React/Next.js (Versión Completa):
```tsx
<div 
  className="grid gap-1"
  style={{ 
    gridTemplateColumns: 'repeat(25, minmax(0, 1fr))',
    gridTemplateRows: 'repeat(20, minmax(0, 1fr))'
  }}
>
  {/* 500 boletos */}
</div>
```

## 📱 Responsive Design

### Desktop (> 1024px):
- Grid completo visible
- Tamaño de botón: 40x40px
- Sin scroll horizontal

### Tablet (768px - 1024px):
- Grid con scroll horizontal suave
- Tamaño de botón: 40x40px
- Mantiene 25 columnas

### Mobile (< 768px):
- Grid con scroll horizontal
- Tamaño de botón: 35x35px
- Mantiene 25 columnas fijas

## 🔄 Actualización en Tiempo Real

### Intervalo de actualización:
- **Versión Simple:** Cada 30 segundos
- **Versión Next.js:** Cada 10 segundos

### Eventos que actualizan el panel:
1. ✅ Compra de boleto
2. ✅ Reserva de boleto
3. ✅ Expiración de reserva
4. ✅ Validación de pago
5. ✅ Rechazo de pago
6. ✅ Venta física

## 🖱️ Interactividad

### En modo selección (página de compra):
```
┌──────┐  Hover   ┌──────┐  Click   ┌──────┐
│  25  │  ────>   │  25  │  ────>   │  25✓ │
│ 🟢   │          │ 🟢 ▲ │          │ 🔵 ▲ │
└──────┘          └──────┘          └──────┘
  Normal         Hover (zoom)      Seleccionado
```

### En modo visualización (página principal):
```
┌──────┐  Hover   ┌──────┐
│  25  │  ────>   │  25  │
│ 🟢   │          │ 🟢   │  [Tooltip: "Boleto #25 - Disponible"]
└──────┘          └──────┘
  Normal         Hover (tooltip)
```

## 🎯 Características Visuales

### Títulos y etiquetas:
```
╔═══════════════════════════════════════╗
║   Panel de Boletos (25 x 20)         ║
║      Total: 500 boletos              ║
╠═══════════════════════════════════════╣
║                                       ║
║   [Leyenda de colores]               ║
║                                       ║
║   ┌─────────────────────────────┐   ║
║   │  Grid 25x20                 │   ║
║   │  [500 boletos]              │   ║
║   └─────────────────────────────┘   ║
║                                       ║
╚═══════════════════════════════════════╝
```

### Efectos y animaciones:
1. **Hover:** Escala 1.1x (zoom ligero)
2. **Selección:** Borde azul + checkmark
3. **Transición:** 200ms suave
4. **Shadow:** Sombra en hover

## 📊 Estadísticas del Panel

### Información mostrada sobre el grid:
```
┌──────────────────────────────────────────┐
│  Total: 500      Disponibles: 350       │
│  Vendidos: 120   Pendientes: 20         │
│  Reservados: 10                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━  24% vendido │
└──────────────────────────────────────────┘
```

## 🔍 Zoom y Navegación

### Controles:
- **Scroll horizontal:** Arrastrar o usar barra de scroll
- **Teclado:** Flechas para navegar (en modo accesible)
- **Touch:** Deslizar con dedo en móviles

### Ejemplo de navegación móvil:
```
Pantalla móvil (320px ancho):
┌──────────┐
│[1][2][3] │◄─── Visible
│[26][27][28]    
│[51][52][53]    ←→ Scroll para ver más
└──────────┘     
  Columnas 1-3 de 25
```

## 🎨 Personalización

### Variables CSS disponibles:
```css
:root {
  --ticket-size: 40px;           /* Tamaño de boleto */
  --ticket-gap: 0.25rem;         /* Espacio entre boletos */
  --color-disponible: #10b981;   /* Verde */
  --color-vendido: #ef4444;      /* Rojo */
  --color-pendiente: #f59e0b;    /* Amarillo */
  --color-fisico: #8b5cf6;       /* Morado */
  --color-reservado: #d1d5db;    /* Gris */
}
```

## 📈 Rendimiento

### Optimizaciones implementadas:
1. ✅ Renderizado eficiente (solo actualiza cambios)
2. ✅ Lazy loading de imágenes
3. ✅ Debounce en búsquedas
4. ✅ Cache de estados
5. ✅ Virtual scrolling (en grids muy grandes)

### Métricas objetivo:
- **Carga inicial:** < 2 segundos
- **Actualización:** < 500ms
- **Smooth scroll:** 60fps

## 🛠️ Mantenimiento

### Cambiar número de boletos:
1. Modificar en configuración: `total_boletos: 500`
2. Ajustar grid si es necesario:
   - Para 1000 boletos: 25x40 o 50x20
   - Para 250 boletos: 25x10 o 20x12.5

### Cambiar tamaño del grid:
```css
/* Para grid 20x25 (500 boletos) */
grid-template-columns: repeat(20, minmax(45px, 1fr));
```

## ✅ Checklist de Funcionalidad

- [✓] Grid de 25x20 visible
- [✓] 500 boletos numerados correctamente
- [✓] Colores por estado funcionando
- [✓] Hover effects activos
- [✓] Selección múltiple funcionando
- [✓] Actualización automática
- [✓] Responsive en móviles
- [✓] Scroll horizontal suave
- [✓] Tooltips informativos
- [✓] Leyenda visible
- [✓] Estadísticas actualizadas

## 🎉 Resultado Final

El panel de 25x20 proporciona:
1. ✅ Vista clara de todos los 500 boletos
2. ✅ Estado en tiempo real
3. ✅ Fácil navegación y selección
4. ✅ Experiencia de usuario óptima
5. ✅ Diseño profesional y moderno

---

**Nota:** El panel está completamente implementado y funcional en ambas versiones del proyecto (Simple y Next.js).







