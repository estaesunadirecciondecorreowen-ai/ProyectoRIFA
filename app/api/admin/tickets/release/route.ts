import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { ticketNumber } = await request.json();

    if (!ticketNumber || typeof ticketNumber !== 'number') {
      return NextResponse.json(
        { error: 'Número de boleto inválido' },
        { status: 400 }
      );
    }

    // Buscar el boleto
    const ticket = await prisma.ticket.findUnique({
      where: { numero: ticketNumber },
      include: {
        purchase: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Boleto no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el boleto pueda ser liberado
    if (ticket.estado === 'available') {
      return NextResponse.json(
        { error: 'El boleto ya está disponible' },
        { status: 400 }
      );
    }

    if (ticket.estado === 'sold' || ticket.estado === 'sold_physical') {
      return NextResponse.json(
        { error: 'No se puede liberar un boleto ya vendido' },
        { status: 400 }
      );
    }

    // Liberar el boleto
    await prisma.ticket.update({
      where: { numero: ticketNumber },
      data: {
        estado: 'available',
        user_id: null,
        purchase_id: null,
        reserved_until: null,
      },
    });

    // Si tenía una compra asociada con solo este boleto, cancelarla
    if (ticket.purchase_id) {
      const remainingTickets = await prisma.ticket.findMany({
        where: {
          purchase_id: ticket.purchase_id,
          numero: { not: ticketNumber },
        },
      });

      // Si era el único boleto de la compra, cancelar la compra
      if (remainingTickets.length === 0) {
        await prisma.purchase.update({
          where: { id: ticket.purchase_id },
          data: { status: 'cancelled' },
        });
      }
    }

    return NextResponse.json({
      message: `Boleto #${ticketNumber} liberado exitosamente`,
      ticket: {
        numero: ticket.numero,
        estado: 'available',
      },
    });
  } catch (error) {
    console.error('Error al liberar boleto:', error);
    return NextResponse.json(
      { error: 'Error al liberar boleto' },
      { status: 500 }
    );
  }
}

