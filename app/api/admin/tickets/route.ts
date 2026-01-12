import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { numero: 'asc' },
      select: {
        id: true,
        numero: true,
        estado: true,
        user: { select: { nombre: true, email: true, telefono: true } },
        purchase: {
          select: {
            method: true,
            comprador_nombre: true,
            telefono_comprador: true,
            vendedor_nombre: true,
            user: { select: { email: true } }, // por si quieres el email del usuario dueño
            transfer: { select: { folio: true } },
          },
        },
      },
    });

    const rows = tickets.map((t) => {
      const comprador =
        t.purchase?.comprador_nombre ||
        t.user?.nombre ||
        '—';

      const correo =
        t.user?.email ||
        t.purchase?.user?.email ||
        '—';

      const telefono =
        t.purchase?.telefono_comprador ||
        t.user?.telefono ||
        'Pendiente';

      const folio = t.purchase?.transfer?.folio || '-';
      const method = t.purchase?.method || '—';
      const vendedor = t.purchase?.vendedor_nombre || '—';

      return {
        id: t.id,
        numero: t.numero,
        estado: t.estado,
        comprador,
        correo,
        telefono,
        folio,
        method,
        vendedor,
      };
    });

    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Error admin tickets:', error);
    return NextResponse.json({ error: 'Error al obtener base de boletos' }, { status: 500 });
  }
}
