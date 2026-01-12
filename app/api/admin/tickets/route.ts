import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();

    const qNumber = q !== '' && !Number.isNaN(Number(q)) ? Number(q) : null;

    const tickets = await prisma.ticket.findMany({
      orderBy: { numero: 'asc' },
      where: q
        ? {
            OR: [
              ...(qNumber !== null ? [{ numero: qNumber }] : []),

              // User
              { user: { nombre: { contains: q, mode: 'insensitive' } } },
              { user: { email: { contains: q, mode: 'insensitive' } } },
              { user: { telefono: { contains: q, mode: 'insensitive' } } },

              // Purchase
              { purchase: { comprador_nombre: { contains: q, mode: 'insensitive' } } },
              { purchase: { telefono_comprador: { contains: q, mode: 'insensitive' } } },
              { purchase: { vendedor_nombre: { contains: q, mode: 'insensitive' } } },
              { purchase: { unique_code: { contains: q, mode: 'insensitive' } } },
              { purchase: { method: { contains: q, mode: 'insensitive' } } },

              // Transfer
              { purchase: { transfer: { folio: { contains: q, mode: 'insensitive' } } } },
            ],
          }
        : undefined,
      select: {
        id: true,
        numero: true,
        estado: true,
        updated_at: true,
        user: { select: { nombre: true, email: true, telefono: true } },
        purchase: {
          select: {
            comprador_nombre: true,
            telefono_comprador: true,
            vendedor_nombre: true,
            method: true,
            unique_code: true,
            transfer: { select: { folio: true } },
          },
        },
      },
    });

    const rows = tickets.map((t) => ({
      id: t.id,
      numero: t.numero,
      estado: t.estado,
      updated_at: t.updated_at,

      comprador_nombre: t.purchase?.comprador_nombre ?? t.user?.nombre ?? null,
      correo: t.user?.email ?? null,
      telefono: t.purchase?.telefono_comprador ?? t.user?.telefono ?? null,

      vendedor_nombre: t.purchase?.vendedor_nombre ?? null,
      metodo: t.purchase?.method ?? null,
      folio: t.purchase?.transfer?.folio ?? null,
      unique_code: t.purchase?.unique_code ?? null,
    }));

    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Error obteniendo tickets admin:', error);
    return NextResponse.json({ error: 'Error al obtener tickets admin' }, { status: 500 });
  }
}
