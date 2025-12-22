import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { generateUniqueCode } from '@/lib/utils';

const RESERVATION_TIME_MINUTES = 20;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { ticketNumbers } = await request.json();

    if (!ticketNumbers || !Array.isArray(ticketNumbers) || ticketNumbers.length === 0) {
      return NextResponse.json(
        { error: 'Debe seleccionar al menos un boleto' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    // Verificar que el usuario esté verificado
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.email_verified) {
      return NextResponse.json(
        { error: 'Debes verificar tu correo electrónico antes de comprar boletos' },
        { status: 403 }
      );
    }

    // Verificar que todos los boletos estén disponibles
    const tickets = await prisma.ticket.findMany({
      where: {
        numero: { in: ticketNumbers },
      },
    });

    const unavailableTickets = tickets.filter(
      (t) => t.estado !== 'available'
    );

    if (unavailableTickets.length > 0) {
      return NextResponse.json(
        { 
          error: 'Algunos boletos ya no están disponibles',
          unavailableTickets: unavailableTickets.map(t => t.numero),
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

    // Crear compra
    const ticketPrice = parseFloat(process.env.NEXT_PUBLIC_TICKET_PRICE || '100');
    const total = ticketPrice * ticketNumbers.length;
    const uniqueCode = generateUniqueCode();

    const purchase = await prisma.purchase.create({
      data: {
        user_id: userId,
        total,
        status: 'pending',
        method: 'transferencia',
        unique_code: uniqueCode,
      },
    });

    // Reservar boletos
    const reservedUntil = new Date(Date.now() + RESERVATION_TIME_MINUTES * 60000);

    await prisma.ticket.updateMany({
      where: {
        numero: { in: ticketNumbers },
        estado: 'available',
      },
      data: {
        estado: 'reserved_pending_payment',
        user_id: userId,
        purchase_id: purchase.id,
        reserved_until: reservedUntil,
      },
    });

    return NextResponse.json({
      message: 'Boletos reservados exitosamente',
      purchaseId: purchase.id,
      uniqueCode,
      total,
      reservedUntil,
      expiresInMinutes: RESERVATION_TIME_MINUTES,
    });
  } catch (error) {
    console.error('Error al reservar boletos:', error);
    return NextResponse.json(
      { error: 'Error al reservar boletos' },
      { status: 500 }
    );
  }
}


