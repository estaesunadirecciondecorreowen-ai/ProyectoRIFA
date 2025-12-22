# 🎫 Sistema de Rifa Altruista - Versión Simple

Sistema completo de gestión de rifas, fácil de instalar y usar localmente.

## 🚀 Inicio Rápido

### Windows
1. Doble clic en `EJECUTAR.bat`
2. Abre tu navegador en `http://localhost:5000`

### Mac/Linux
1. Abre una terminal en esta carpeta
2. Ejecuta: `bash EJECUTAR.sh`
3. Abre tu navegador en `http://localhost:5000`

## 📋 Requisitos

- Python 3.7 o superior
- Navegador web moderno

## 👤 Usuario Administrador

- **Email:** admin@rifa.com
- **Contraseña:** admin123

## ✨ Características

- ✅ 500 boletos de rifa
- ✅ Sistema de autenticación
- ✅ Reserva temporal de boletos (20 min)
- ✅ Subida de comprobantes de pago
- ✅ Panel de administración
- ✅ Validación de transferencias
- ✅ Registro de ventas físicas
- ✅ Dashboard con estadísticas
- ✅ Actualización en tiempo real

## 📖 Documentación Completa

Lee el archivo `LEEME.txt` para instrucciones detalladas.

## 🎯 Flujo de Uso

1. **Usuario se registra** → Crea una cuenta
2. **Selecciona boletos** → Elige números de la suerte
3. **Realiza transferencia** → Paga y sube comprobante
4. **Admin aprueba** → Valida el pago
5. **Boletos confirmados** → Usuario puede ver sus boletos

## 🔧 Configuración

Edita los datos de la rifa en `app.py`:
- Nombre de la rifa
- Causa benéfica
- Premio
- Precio por boleto
- Fecha del sorteo

## 📁 Estructura

```
simple-version/
├── app.py              # Servidor principal
├── requirements.txt    # Dependencias
├── static/             # CSS y assets
├── templates/          # Páginas HTML
├── uploads/            # Comprobantes
└── rifa.db            # Base de datos (auto-generada)
```

## 💡 Tips

- Los boletos se actualizan cada 30 segundos
- Las reservas expiran en 20 minutos
- Usa `admin@rifa.com` / `admin123` para acceder al panel admin
- Para reiniciar todo, elimina `rifa.db`

## ⚠️ Importante

Esta es una versión para uso local y desarrollo. Para producción:
- Cambia el `secret_key` en `app.py`
- Usa HTTPS
- Configura un servidor de producción
- Usa una base de datos robusta (PostgreSQL)

## 🎊 ¡Listo para Usar!

El sistema está completamente funcional. Solo instala las dependencias y comienza a vender boletos.

---

**Versión:** 1.0.0 Simple  
**Tecnologías:** Python, Flask, SQLite, HTML, CSS, JavaScript

