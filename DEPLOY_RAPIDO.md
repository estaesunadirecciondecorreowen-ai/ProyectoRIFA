# 🚀 Despliegue Rápido en Render - Checklist

## ✅ Pre-requisitos
- [ ] Cuenta en GitHub
- [ ] Cuenta en Render.com
- [ ] Base de datos de Neon.tech activa

---

## 📦 1. Preparar Código (5 minutos)

### Subir a GitHub:
```bash
git init
git add .
git commit -m "Listo para producción"
git remote add origin https://github.com/TU-USUARIO/rifa-altruista.git
git push -u origin main
```

---

## 🌐 2. Configurar Render (10 minutos)

### Crear Web Service:
1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Completa:

**Build Command:**
```
npm install && npx prisma generate && npx prisma db push --accept-data-loss && npm run build
```

**Start Command:**
```
npm start
```

### Variables de Entorno:
```
DATABASE_URL=postgresql://neondb_owner:npg_anbmFAE6V8eI@ep-little-dust-afway67t-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_URL=https://tu-app.onrender.com

NEXTAUTH_SECRET=(generar con: openssl rand -base64 32)

NEXT_PUBLIC_TICKET_PRICE=50

NEXT_PUBLIC_DRAW_DATE=2026-01-06T18:00:00

NODE_VERSION=18
```

---

## 🎯 3. Inicializar (5 minutos)

### En Render Shell:
```bash
npx tsx prisma/seed.ts
npx tsx scripts/crear-admin-rapido.ts
```

### Admin creado:
- Email: `admin@rifa.com`
- Password: `Admin123!`

---

## ✅ 4. Verificar

1. Abre tu URL: `https://tu-app.onrender.com`
2. Verifica que cargue la página principal
3. Login como admin funciona
4. Los boletos se muestran correctamente

---

## 🔄 5. Actualizaciones Futuras

Cada cambio:
```bash
git add .
git commit -m "descripción"
git push
```

Render despliega automáticamente (5-10 min).

---

## ⚠️ Errores Comunes

**"Application failed to respond"**
→ Verifica variables de entorno

**"Prisma Client error"**
→ Ejecuta en Shell: `npx prisma db push`

**"NextAuth error"**
→ Verifica NEXTAUTH_URL sea HTTPS

---

## 📚 Guía Completa

Para más detalles, lee: **GUIA_RENDER.md**

---

**Tiempo Total: 15-20 minutos** ⏱️

