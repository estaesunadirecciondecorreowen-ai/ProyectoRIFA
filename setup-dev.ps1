# Script de configuración rápida para desarrollo local
# Uso: .\setup-dev.ps1 "tu-database-url-aquí"

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseUrl
)

Write-Host "🚀 Configurando proyecto para desarrollo local..." -ForegroundColor Cyan
Write-Host ""

# 1. Actualizar DATABASE_URL en .env
Write-Host "📝 Actualizando .env con la nueva DATABASE_URL..." -ForegroundColor Yellow
$envContent = Get-Content .env
$envContent = $envContent -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$DatabaseUrl`""
$envContent | Set-Content .env
Write-Host "✅ .env actualizado" -ForegroundColor Green
Write-Host ""

# 2. Generar cliente de Prisma
Write-Host "🔧 Generando cliente de Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Cliente de Prisma generado" -ForegroundColor Green
} else {
    Write-Host "❌ Error generando cliente de Prisma" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 3. Crear tablas en la base de datos
Write-Host "🗄️  Creando tablas en la base de datos..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tablas creadas exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error creando tablas" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 4. Poblar con datos iniciales
Write-Host "🎲 Poblando base de datos con 500 boletos y admin..." -ForegroundColor Yellow
npx prisma db seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos poblada" -ForegroundColor Green
} else {
    Write-Host "❌ Error poblando base de datos" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "🎉 ¡Configuración completa!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el servidor de desarrollo, ejecuta:" -ForegroundColor Cyan
Write-Host "    npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Luego abre: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Credenciales de Admin:" -ForegroundColor Yellow
Write-Host "    Email: admin@rifa.com" -ForegroundColor White
Write-Host "    Password: Admin123!" -ForegroundColor White
Write-Host ""

