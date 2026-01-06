import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const numeroConsulta = 110;
  
  console.log(`\n🔍 Consultando información del boleto ${numeroConsulta}...\n`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  const boleto = await prisma.ticket.findUnique({
    where: { numero: numeroConsulta },
    include: {
      purchase: {
        include: {
          user: {
            select: {
              id: true,
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

  if (!boleto) {
    console.log(`❌ El boleto ${numeroConsulta} no existe en el sistema\n`);
    return;
  }

  console.log(`📋 INFORMACIÓN DEL BOLETO ${numeroConsulta}`);
  console.log('─────────────────────────────────────────────────────────────────────────────\n');
  
  console.log(`🎫 Número de Boleto: ${boleto.numero.toString().padStart(3, '0')}`);
  console.log(`📊 Estado: ${boleto.estado}`);
  
  const estadoEmoji: Record<string, string> = {
    'available': '✅ Disponible',
    'reserved': '🔒 Reservado',
    'pending_payment': '⏳ Pendiente de pago',
    'pending_review': '🔍 En revisión',
    'sold': '💰 Vendido',
    'cancelled': '❌ Cancelado',
  };
  
  console.log(`   └─ ${estadoEmoji[boleto.estado] || boleto.estado}`);
  
  if (boleto.purchase) {
    console.log(`\n👤 INFORMACIÓN DEL COMPRADOR:`);
    console.log(`─────────────────────────────────────────────────────────────────────────────`);
    console.log(`   Nombre:   ${boleto.purchase.user.nombre}`);
    console.log(`   Email:    ${boleto.purchase.user.email}`);
    console.log(`   Teléfono: ${boleto.purchase.user.telefono}`);
    
    if (boleto.purchase.comprador_nombre) {
      console.log(`\n📝 DATOS DE LA COMPRA:`);
      console.log(`─────────────────────────────────────────────────────────────────────────────`);
      console.log(`   Comprador: ${boleto.purchase.comprador_nombre}`);
      if (boleto.purchase.telefono_comprador) {
        console.log(`   Teléfono:  ${boleto.purchase.telefono_comprador}`);
      }
      if (boleto.purchase.vendedor_nombre) {
        console.log(`   Vendedor:  ${boleto.purchase.vendedor_nombre}`);
      }
    }
    
    console.log(`\n💳 INFORMACIÓN DE PAGO:`);
    console.log(`─────────────────────────────────────────────────────────────────────────────`);
    console.log(`   Código único: ${boleto.purchase.unique_code}`);
    console.log(`   Total:        $${boleto.purchase.total.toFixed(2)} MXN`);
    console.log(`   Método:       ${boleto.purchase.method}`);
    console.log(`   Estado pago:  ${boleto.purchase.status}`);
    console.log(`   Fecha compra: ${new Date(boleto.purchase.created_at).toLocaleString('es-MX')}`);
    
    if (boleto.purchase.transfer) {
      console.log(`\n💰 INFORMACIÓN DE TRANSFERENCIA:`);
      console.log(`─────────────────────────────────────────────────────────────────────────────`);
      console.log(`   Folio:  ${boleto.purchase.transfer.folio}`);
      console.log(`   Monto:  $${boleto.purchase.transfer.monto.toFixed(2)} MXN`);
      console.log(`   Fecha:  ${new Date(boleto.purchase.transfer.fecha).toLocaleDateString('es-MX')}`);
      console.log(`   Estado: ${boleto.purchase.transfer.status}`);
      
      if (boleto.purchase.transfer.admin_notes) {
        console.log(`   Notas:  ${boleto.purchase.transfer.admin_notes}`);
      }
    }
    
    // Obtener todos los boletos de esta compra
    const todosBoletos = await prisma.ticket.findMany({
      where: { purchase_id: boleto.purchase.id },
      orderBy: { numero: 'asc' },
    });
    
    if (todosBoletos.length > 1) {
      console.log(`\n🎫 OTROS BOLETOS EN ESTA COMPRA:`);
      console.log(`─────────────────────────────────────────────────────────────────────────────`);
      console.log(`   Total de boletos: ${todosBoletos.length}`);
      console.log(`   Números: ${todosBoletos.map(t => t.numero.toString().padStart(3, '0')).join(', ')}`);
    }
  } else {
    console.log(`\n✅ Este boleto está DISPONIBLE para compra`);
  }
  
  if (boleto.pdf_generado) {
    console.log(`\n📄 PDF:`);
    console.log(`─────────────────────────────────────────────────────────────────────────────`);
    console.log(`   ✅ PDF Generado: Sí`);
    if (boleto.pdf_filename) {
      console.log(`   📁 Archivo: ${boleto.pdf_filename}`);
    }
  }
  
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


