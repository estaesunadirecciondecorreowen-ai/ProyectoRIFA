import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const numeroConsulta = 29;
  
  console.log(`\n🔍 Consultando boleto ${numeroConsulta}...\n`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const boleto = await prisma.ticket.findUnique({
    where: { numero: numeroConsulta },
    include: {
      purchase: {
        include: {
          user: {
            select: {
              nombre: true,
              email: true,
              telefono: true,
              rol: true,
            },
          },
          transfer: true,
          tickets: {
            orderBy: { numero: 'asc' },
          },
        },
      },
    },
  });

  if (!boleto) {
    console.log(`❌ El boleto ${numeroConsulta} no existe en el sistema\n`);
    return;
  }

  console.log(`🎫 BOLETO ${numeroConsulta.toString().padStart(3, '0')}`);
  console.log('─────────────────────────────────────────────────────────────────────────────');
  console.log(`📊 Estado: ${boleto.estado}\n`);

  if (!boleto.purchase) {
    console.log('✅ DISPONIBLE para compra (sin reserva)\n');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    return;
  }

  const purchase = boleto.purchase;

  // Verificar si es venta física
  const esVentaFisica = !!(purchase.vendedor_nombre && purchase.comprador_nombre);

  if (esVentaFisica) {
    console.log('🏪 TIPO DE VENTA: VENTA FÍSICA\n');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(`👥 Comprador:  ${purchase.comprador_nombre}`);
    console.log(`📱 Teléfono:   ${purchase.telefono_comprador || 'No especificado'}`);
    console.log(`👤 Vendedor:   ${purchase.vendedor_nombre}`);
  } else {
    console.log('💻 TIPO DE VENTA: VENTA EN LÍNEA\n');
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(`👤 Nombre:     ${purchase.user.nombre}`);
    console.log(`📧 Email:      ${purchase.user.email}`);
    console.log(`📱 Teléfono:   ${purchase.user.telefono}`);
    console.log(`🔑 Rol:        ${purchase.user.rol}`);
  }

  console.log(`\n💳 INFORMACIÓN DE LA COMPRA:`);
  console.log('─────────────────────────────────────────────────────────────────────────────');
  console.log(`   Código único:     ${purchase.unique_code}`);
  console.log(`   Total:            $${purchase.total.toFixed(2)} MXN`);
  console.log(`   Estado:           ${purchase.status}`);
  console.log(`   Método de pago:   ${purchase.method}`);
  console.log(`   Fecha de compra:  ${new Date(purchase.created_at).toLocaleString('es-MX')}`);

  if (purchase.transfer) {
    console.log(`\n💰 TRANSFERENCIA:`);
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(`   Folio:         ${purchase.transfer.folio}`);
    console.log(`   Monto:         $${purchase.transfer.monto.toFixed(2)} MXN`);
    console.log(`   Fecha:         ${new Date(purchase.transfer.fecha).toLocaleDateString('es-MX')}`);
    console.log(`   Estado:        ${purchase.transfer.status}`);
    
    if (purchase.transfer.comprobante_url) {
      console.log(`   Comprobante:   Subido ✅`);
    }
    
    if (purchase.transfer.admin_notes) {
      console.log(`   Notas admin:   ${purchase.transfer.admin_notes}`);
    }
  } else if (purchase.method === 'transferencia') {
    console.log(`\n⚠️  SIN TRANSFERENCIA REGISTRADA`);
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log('   El usuario aún no ha subido el comprobante de pago');
  }

  if (purchase.tickets.length > 1) {
    console.log(`\n🎫 OTROS BOLETOS EN ESTA COMPRA:`);
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(`   Total de boletos: ${purchase.tickets.length}`);
    console.log(`   Números: ${purchase.tickets.map(t => t.numero.toString().padStart(3, '0')).join(', ')}`);
  } else if (purchase.tickets.length === 1) {
    console.log(`\n🎫 Compra de 1 solo boleto`);
  }

  if (boleto.pdf_generado) {
    console.log(`\n📄 PDF:`);
    console.log('─────────────────────────────────────────────────────────────────────────────');
    console.log(`   ✅ PDF Generado`);
    if (boleto.pdf_filename) {
      console.log(`   📁 Archivo: ${boleto.pdf_filename}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  
  // Resumen
  if (esVentaFisica) {
    console.log(`\n✅ Boleto vendido físicamente por ${purchase.vendedor_nombre}`);
  } else {
    console.log(`\n✅ Boleto reservado por ${purchase.user.nombre} (${purchase.user.email})`);
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


