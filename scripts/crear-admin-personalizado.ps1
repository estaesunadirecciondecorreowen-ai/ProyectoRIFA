# Script para crear usuario administrador personalizado
Write-Host "🔐 Crear nuevo usuario administrador personalizado" -ForegroundColor Cyan
Write-Host ""

# Solicitar datos
$nombre = Read-Host "Nombre del administrador"
$email = Read-Host "Email del administrador"
$password = Read-Host "Contraseña" -AsSecureString
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
$telefono = Read-Host "Teléfono (opcional, presiona Enter para omitir)"

Write-Host ""
Write-Host "Creando usuario..." -ForegroundColor Yellow
Write-Host ""

# Crear archivo temporal con los datos
$scriptContent = @"
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = '$email'.trim().toLowerCase();
  
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log('❌ Error: Ya existe un usuario con ese email');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash('$plainPassword', 10);

  const admin = await prisma.user.create({
    data: {
      nombre: '$nombre'.trim(),
      email,
      telefono: '$telefono'.trim() || '0000000000',
      password_hash,
      email_verified: true,
      rol: 'ADMIN',
    },
  });

  console.log('✅ ¡Usuario administrador creado exitosamente!\n');
  console.log('📧 Email:', admin.email);
  console.log('👤 Nombre:', admin.nombre);
  console.log('🔑 Rol: ADMINISTRADOR');
  console.log('\n🔗 Inicia sesión en: http://localhost:3000/auth/login\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.disconnect();
  });
"@

$scriptContent | Out-File -FilePath "scripts\temp-crear-admin.ts" -Encoding UTF8

# Ejecutar el script
npx ts-node --compiler-options '{\"module\":\"CommonJS\"}' scripts/temp-crear-admin.ts

# Eliminar archivo temporal
Remove-Item "scripts\temp-crear-admin.ts" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✨ Proceso completado" -ForegroundColor Green

