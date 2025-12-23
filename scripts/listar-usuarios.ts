import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Listado de Usuarios Registrados\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const users = await prisma.user.findMany({
    orderBy: {
      created_at: 'desc',
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      telefono: true,
      rol: true,
      email_verified: true,
      created_at: true,
      _count: {
        select: {
          purchases: true,
        },
      },
    },
  });

  if (users.length === 0) {
    console.log('❌ No hay usuarios registrados\n');
    return;
  }

  console.log(`Total de usuarios: ${users.length}\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.nombre}`);
    console.log(`   📧 Email:    ${user.email}`);
    console.log(`   📱 Teléfono: ${user.telefono || 'No especificado'}`);
    console.log(`   🔑 Rol:      ${user.rol}`);
    console.log(`   ✅ Verificado: ${user.email_verified ? 'Sí' : 'No'}`);
    console.log(`   🛒 Compras:  ${user._count.purchases}`);
    console.log(`   📅 Registro: ${user.created_at.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`);
    console.log('   ─────────────────────────────────────────────────────────────────────────');
  });

  // Estadísticas
  const admins = users.filter(u => u.rol === 'ADMIN').length;
  const regulares = users.filter(u => u.rol === 'USER').length;
  const verificados = users.filter(u => u.email_verified).length;
  const totalCompras = users.reduce((acc, u) => acc + u._count.purchases, 0);

  console.log('\n📊 Estadísticas:');
  console.log(`   👑 Administradores: ${admins}`);
  console.log(`   👤 Usuarios regulares: ${regulares}`);
  console.log(`   ✅ Emails verificados: ${verificados} de ${users.length}`);
  console.log(`   🛒 Total de compras: ${totalCompras}`);
  console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

