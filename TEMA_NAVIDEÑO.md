# 🎄 Tema Navideño de la Rifa

## Cambios Implementados

### 🎨 Diseño Visual

#### Colores Principales
- **Fondo**: Degradado de rojos oscuros (`from-red-900 via-red-800 to-red-900`)
- **Hero Section**: Degradado rojo-verde navideño (`from-red-700 via-red-600 to-green-700`)
- **Acentos**: Verde navideño y blanco para contraste

#### Efectos Especiales
- ❄️ **Nieve cayendo**: Efecto de copos de nieve animados en toda la página
- 🎄 **Emojis navideños**: Árbol de navidad, Santa Claus, regalos
- ✨ **Animaciones**: Efectos de brillo y movimiento suave

### 📅 Contador de Sorteo

**Fecha del Sorteo**: 6 de Enero 2025 a las 6:00 AM

El contador muestra:
- Días restantes
- Horas restantes
- Minutos restantes
- Segundos restantes

### 🔗 Link de Noticia Oficial

Se agregó un botón destacado con el link a la noticia oficial:
- **URL**: https://x.com/telediario/status/1985533370336702812?s=12
- **Ubicación**: Debajo del contador en la página principal
- **Estilo**: Botón blanco con ícono de X (Twitter) que se abre en nueva pestaña

### 🔐 Página de Login

**Cambios de Estilo**:
- Fondo rojo navideño con nieve cayendo
- **Letras en negro** en todo el formulario
- Emoji de árbol de navidad (🎄) en el encabezado
- Botones en rojo navideño
- Links en rojo para mantener coherencia

### 🎯 Componentes Modificados

1. **`app/page.tsx`** - Página principal
   - Fondo rojo
   - Efecto de nieve
   - Link de noticia
   - Hero section navideño

2. **`app/auth/login/page.tsx`** - Login
   - Fondo rojo
   - Letras negras
   - Efecto de nieve
   - Estilo navideño

3. **`components/Countdown.tsx`** - Contador
   - Fecha: 6 de Enero 2025, 6:00 AM
   - Colores navideños (rojo y verde)
   - Emojis festivos

4. **`components/SnowEffect.tsx`** - Nieve (NUEVO)
   - 150 copos de nieve animados
   - Movimiento realista con viento
   - Canvas con transparencia

5. **`app/globals.css`** - Estilos
   - Scrollbar rojo navideño
   - Animaciones adicionales
   - Efectos de brillo

### 📱 Características Técnicas

#### Efecto de Nieve
```typescript
- 150 copos de nieve
- Velocidad variable (0.5 - 1.5)
- Movimiento horizontal (viento)
- Canvas HTML5
- z-index: 50 (sobre todo el contenido)
- pointer-events: none (no interfiere con clicks)
```

#### Contador Regresivo
```typescript
Fecha objetivo: 2025-01-06T06:00:00
Actualización: cada 1 segundo
Zonas de tiempo: Local del navegador
```

### 🌟 Elementos Visuales Destacados

- 🎄 Árbol de navidad en hero section
- 🎅 Santa Claus en footer
- ❄️ Nieve cayendo en toda la página
- 🎁 Botones con estilo festivo
- ⭐ Bordes blancos decorativos

### 📊 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Rojo Oscuro | `#7f1d1d` | Fondo principal |
| Rojo Medio | `#991b1b` | Secciones intermedias |
| Rojo Brillante | `#dc2626` | Botones y acentos |
| Verde Navideño | `#15803d` | Acentos complementarios |
| Blanco | `#ffffff` | Texto y contraste |
| Negro | `#000000` | Texto en login |

### 🚀 Despliegue

Los cambios están listos para producción. El tema se activará automáticamente al desplegar.

### 🔄 Revertir Tema (si es necesario)

Para volver al tema original:

1. Cambiar `from-red-900` por `from-gray-50` en fondos
2. Remover `<SnowEffect />` de las páginas
3. Cambiar fecha del contador a la original
4. Restaurar colores originales en login

### 📝 Notas Adicionales

- El efecto de nieve funciona en todos los navegadores modernos
- La página es responsive (mobile-friendly)
- Los colores mantienen buen contraste para accesibilidad
- Las animaciones son suaves y no afectan el rendimiento

---

**Tema creado el**: 22 de Diciembre 2024
**Sorteo programado**: 6 de Enero 2025, 6:00 AM
**Link de noticia**: https://x.com/telediario/status/1985533370336702812?s=12

🎄 ¡Felices Fiestas! 🎅

