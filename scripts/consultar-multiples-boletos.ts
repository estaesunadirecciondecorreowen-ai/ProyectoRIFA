import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const numerosConsulta = [9, 14, 15];
  
  console.log('\n🔍 Consultando boletos:', numerosConsulta.join(', '));
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  for (const numero of numerosConsulta) {
    const boleto = await prisma.ticket.findUnique({
      where: { numero },
      include: {
        purchase: {
          include: {
            user: {
              select: {
                nombre: true,
                email: true,
                telefono: true,
              },
            },
            transfer: true,
          },
        },
      },
    });

    console.log(`\n🎫 BOLETO ${numero.toString().padStart(3, '0')}`);
    console.log('─────────────────────────────────────────────────────────────────────────────');

    if (!boleto) {
      console.log('❌ No existe en el sistema\n');
      continue;
    }

    console.log(`📊 Estado: ${boleto.estado}`);

    if (!boleto.purchase) {
      console.log('✅ DISPONIBLE (sin compra asociada)\n');
      continue;
    }

    const purchase = boleto.purchase;

    // Verificar si es venta física
    const esVentaFisica = !!(purchase.vendedor_nombre && purchase.comprador_nombre);

    if (esVentaFisica) {
      console.log('\n🏪 TIPO: VENTA FÍSICA');
      console.log(`   👥 Comprador:  ${purchase.comprador_nombre}`);
      console.log(`   📱 Teléfono:   ${purchase.telefono_comprador || 'No especificado'}`);
      console.log(`   👤 Vendedor:   ${purchase.vendedor_nombre}`);
    } else {
      console.log('\n💻 TIPO: VENTA EN LÍNEA');
      console.log(`   👤 Usuario:    ${purchase.user.nombre}`);
      console.log(`   📧 Email:      ${purchase.user.email}`);
      console.log(`   📱 Teléfono:   ${purchase.user.telefono}`);
    }

    console.log(`\n💳 Información de compra:`);
    console.log(`   Código:        ${purchase.unique_code}`);
    console.log(`   Total:         $${purchase.total.toFixed(2)} MXN`);
    console.log(`   Estado:        ${purchase.status}`);
    console.log(`   Método:        ${purchase.method}`);
    console.log(`   Fecha:         ${new Date(purchase.created_at).toLocaleString('es-MX')}`);

    if (purchase.transfer) {
      console.log(`\n💰 Transferencia:`);
      console.log(`   Folio:         ${purchase.transfer.folio}`);
      console.log(`   Monto:         $${purchase.transfer.monto.toFixed(2)} MXN`);
      console.log(`   Estado:        ${purchase.transfer.status}`);
    } else {
      console.log(`\n⚠️  Sin transferencia registrada`);
    }

    // Contar boletos en la misma compra
    const todosBoletos = await prisma.ticket.findMany({
      where: { purchase_id: purchase.id },
      orderBy: { numero: 'asc' },
    });

    if (todosBoletos.length > 1) {
      console.log(`\n🎫 Parte de una compra de ${todosBoletos.length} boletos:`);
      console.log(`   Números: ${todosBoletos.map(t => t.numero.toString().padStart(3, '0')).join(', ')}`);
    }

    console.log('');
  }

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


