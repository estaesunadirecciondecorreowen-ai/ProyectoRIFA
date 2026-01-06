import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const emailConsulta = 'danycorts1@gmail.com';
  
  console.log(`\n🔍 Consultando compras del usuario: ${emailConsulta}\n`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email: emailConsulta.toLowerCase() },
    include: {
      purchases: {
        include: {
          tickets: {
            orderBy: { numero: 'asc' },
          },
          transfer: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      },
    },
  });

  if (!user) {
    console.log(`❌ No se encontró el usuario con email: ${emailConsulta}\n`);
    return;
  }

  console.log(`👤 INFORMACIÓN DEL USUARIO`);
  console.log('─────────────────────────────────────────────────────────────────────────────');
  console.log(`   Nombre:   ${user.nombre}`);
  console.log(`   Email:    ${user.email}`);
  console.log(`   Teléfono: ${user.telefono}`);
  console.log(`   Rol:      ${user.rol}`);
  console.log(`   Verificado: ${user.email_verified ? 'Sí' : 'No'}`);
  console.log(`   Registro: ${new Date(user.created_at).toLocaleString('es-MX')}\n`);

  if (user.purchases.length === 0) {
    console.log('📭 Este usuario no ha realizado ninguna compra\n');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    return;
  }

  console.log(`🛒 COMPRAS REALIZADAS: ${user.purchases.length}\n`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  for (let i = 0; i < user.purchases.length; i++) {
    const purchase = user.purchases[i];
    
    console.log(`\n📦 COMPRA #${i + 1}`);
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(`🔑 Código único:     ${purchase.unique_code}`);
    console.log(`📅 Fecha de compra:  ${new Date(purchase.created_at).toLocaleString('es-MX')}`);
    console.log(`💰 Total:            $${purchase.total.toFixed(2)} MXN`);
    console.log(`💳 Método de pago:   ${purchase.method}`);
    console.log(`📊 Estado:           ${purchase.status}`);

    // Verificar si es venta física
    const esVentaFisica = !!(purchase.vendedor_nombre && purchase.comprador_nombre);
    
    if (esVentaFisica) {
      console.log(`\n🏪 TIPO: VENTA FÍSICA`);
      console.log(`   Comprador: ${purchase.comprador_nombre}`);
      console.log(`   Teléfono:  ${purchase.telefono_comprador || 'No especificado'}`);
      console.log(`   Vendedor:  ${purchase.vendedor_nombre}`);
    }

    // Boletos
    console.log(`\n🎫 BOLETOS (${purchase.tickets.length}):`);
    const numerosBoletos = purchase.tickets.map(t => t.numero.toString().padStart(3, '0')).join(', ');
    console.log(`   ${numerosBoletos}`);
    
    // Estado de los boletos
    const estadosBoletos = purchase.tickets.reduce((acc: any, ticket) => {
      acc[ticket.estado] = (acc[ticket.estado] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📊 Estado de los boletos:`);
    for (const [estado, cantidad] of Object.entries(estadosBoletos)) {
      const estadosEmoji: Record<string, string> = {
        'available': '✅ Disponibles',
        'reserved': '🔒 Reservados',
        'pending_payment': '⏳ Pendiente de pago',
        'pending_review': '🔍 En revisión',
        'sold': '💰 Vendidos',
        'cancelled': '❌ Cancelados',
        'reserved_pending_payment': '⏳ Reservado pendiente pago',
      };
      console.log(`   ${estadosEmoji[estado] || estado}: ${cantidad}`);
    }

    // Transferencia
    if (purchase.transfer) {
      console.log(`\n💰 INFORMACIÓN DE TRANSFERENCIA:`);
      console.log(`   Folio:         ${purchase.transfer.folio}`);
      console.log(`   Monto:         $${purchase.transfer.monto.toFixed(2)} MXN`);
      console.log(`   Fecha:         ${new Date(purchase.transfer.fecha).toLocaleDateString('es-MX')}`);
      console.log(`   Estado:        ${purchase.transfer.status}`);
      
      if (purchase.transfer.comprobante_url) {
        console.log(`   Comprobante:   ${purchase.transfer.comprobante_url}`);
      }
      
      if (purchase.transfer.admin_notes) {
        console.log(`   Notas admin:   ${purchase.transfer.admin_notes}`);
      }
    } else if (purchase.method === 'transferencia') {
      console.log(`\n⚠️  Esperando que el usuario suba el comprobante de transferencia`);
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════════════════════════════════════════════');
  
  // Resumen
  const totalBoletos = user.purchases.reduce((acc, p) => acc + p.tickets.length, 0);
  const totalGastado = user.purchases.reduce((acc, p) => acc + p.total, 0);
  const comprasAprobadas = user.purchases.filter(p => p.status === 'approved').length;
  const comprasPendientes = user.purchases.filter(p => p.status === 'pending' || p.status === 'pending_review').length;

  console.log(`\n📊 RESUMEN DEL USUARIO`);
  console.log('─────────────────────────────────────────────────────────────────────────────');
  console.log(`   Total de compras:      ${user.purchases.length}`);
  console.log(`   Total de boletos:      ${totalBoletos}`);
  console.log(`   Total gastado:         $${totalGastado.toFixed(2)} MXN`);
  console.log(`   Compras aprobadas:     ${comprasAprobadas}`);
  console.log(`   Compras pendientes:    ${comprasPendientes}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


