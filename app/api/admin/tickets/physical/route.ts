import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { generateUniqueCode } from '@/lib/utils';
import { TicketStatus, PurchaseStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { ticketNumbers, buyerName, buyerEmail, sellerName, notes } = await request.json();

    if (!ticketNumbers || !Array.isArray(ticketNumbers) || ticketNumbers.length === 0) {
      return NextResponse.json(
        { error: 'Debe seleccionar al menos un boleto' },
        { status: 400 }
      );
    }

    // Verificar que todos los boletos estén disponibles
    const tickets = await prisma.ticket.findMany({
      where: {
        numero: { in: ticketNumbers },
      },
    });

    const unavailableTickets = tickets.filter((t) => t.estado !== TicketStatus.available);

    if (unavailableTickets.length > 0) {
      return NextResponse.json(
        {
          error: 'Algunos boletos ya no están disponibles',
          unavailableTickets: unavailableTickets.map((t) => t.numero),
        },
        { status: 400 }
      );
    }

    if (tickets.length !== ticketNumbers.length) {
      return NextResponse.json(
        { error: 'Algunos boletos no existen' },
        { status: 400 }
      );
    }

    const adminId = (session.user as any).id;
    const ticketPrice = parseFloat(process.env.NEXT_PUBLIC_TICKET_PRICE || '50');
    const total = ticketPrice * ticketNumbers.length;

    // Si se proporcionó email del comprador, buscar o crear usuario
    let userId: string | null = null;

    if (buyerEmail) {
      let user = await prisma.user.findUnique({
        where: { email: buyerEmail },
      });

      if (!user && buyerName) {
        // Crear usuario temporal sin contraseña
        user = await prisma.user.create({
          data: {
            nombre: buyerName,
            email: buyerEmail,
            telefono: '0000000000', // Teléfono por defecto para usuario físico
            password_hash: '', // Usuario físico sin acceso al sistema
            email_verified: false,
          },
        });
      }

      if (user) {
        userId = user.id;
      }
    }

    // Crear compra física
    const uniqueCode = generateUniqueCode();

    const purchase = await prisma.purchase.create({
      data: {
        user_id: userId || adminId, // Si no hay usuario, asignar al admin
        total,
        status: PurchaseStatus.approved,
        method: 'fisico',
        unique_code: uniqueCode,
      },
    });

    // Marcar boletos como vendidos
    const notaParts = [];
    if (buyerName) notaParts.push(`Comprador: ${buyerName}`);
    if (sellerName) notaParts.push(`Vendedor: ${sellerName}`);
    if (notes) notaParts.push(notes);
    const notaFinal = notaParts.length > 0 ? notaParts.join(' | ') : 'Venta física';

    await prisma.ticket.updateMany({
      where: {
        numero: { in: ticketNumbers },
      },
      data: {
        estado: TicketStatus.sold_physical,
        user_id: userId,
        purchase_id: purchase.id,
        nota: notaFinal,
      },
    });

    // Registrar log
    await prisma.adminLog.create({
      data: {
        admin_id: adminId,
        action: 'physical_sale',
        payload: JSON.stringify({
          purchaseId: purchase.id,
          tickets: ticketNumbers,
          buyerName,
          buyerEmail,
          sellerName,
          notes,
        }),
      },
    });

    return NextResponse.json({
      message: 'Venta física registrada exitosamente',
      purchaseId: purchase.id,
      uniqueCode,
    });
  } catch (error) {
    console.error('Error al registrar venta física:', error);
    return NextResponse.json(
      { error: 'Error al registrar venta física' },
      { status: 500 }
    );
  }
}


