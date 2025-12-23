import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { sendEmail, getTicketConfirmationEmailHtml, getTransferRejectedEmailHtml } from '@/lib/email';
import { TicketStatus, PurchaseStatus, TransferStatus } from '@prisma/client';

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

    const { transferId, action, notes } = await request.json();

    if (!transferId || !action) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida' },
        { status: 400 }
      );
    }

    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        purchase: {
          include: {
            user: true,
            tickets: true,
          },
        },
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: 'Transferencia no encontrada' },
        { status: 404 }
      );
    }

    if (transfer.status !== TransferStatus.pending_review) {
      return NextResponse.json(
        { error: 'Esta transferencia ya fue procesada' },
        { status: 400 }
      );
    }

    const adminId = (session.user as any).id;

    if (action === 'approve') {
      // Aprobar transferencia
      await prisma.$transaction(async (tx) => {
        // Actualizar transferencia
        await tx.transfer.update({
          where: { id: transferId },
          data: {
            status: TransferStatus.approved,
            admin_notes: notes,
          },
        });

        // Actualizar compra
        await tx.purchase.update({
          where: { id: transfer.purchase_id },
          data: { status: PurchaseStatus.approved },
        });

        // Actualizar boletos
        await tx.ticket.updateMany({
          where: { purchase_id: transfer.purchase_id },
          data: { estado: TicketStatus.sold },
        });

        // Registrar log
        await tx.adminLog.create({
          data: {
            admin_id: adminId,
            action: 'approve_transfer',
            payload: JSON.stringify({
              transferId,
              purchaseId: transfer.purchase_id,
              tickets: transfer.purchase.tickets.map((t) => t.numero),
            }),
          },
        });
      });

      // Enviar email de confirmación
      const ticketNumbers = transfer.purchase.tickets.map((t) => t.numero);
      await sendEmail({
        to: transfer.purchase.user.email,
        subject: '¡Tu compra ha sido confirmada!',
        html: getTicketConfirmationEmailHtml(
          transfer.purchase.user.nombre,
          ticketNumbers,
          transfer.purchase.unique_code
        ),
      });

      return NextResponse.json({
        message: 'Transferencia aprobada exitosamente',
      });
    } else {
      // Rechazar transferencia
      await prisma.$transaction(async (tx) => {
        // Actualizar transferencia
        await tx.transfer.update({
          where: { id: transferId },
          data: {
            status: TransferStatus.rejected,
            admin_notes: notes,
          },
        });

        // Actualizar compra
        await tx.purchase.update({
          where: { id: transfer.purchase_id },
          data: { status: PurchaseStatus.rejected },
        });

        // Liberar boletos
        await tx.ticket.updateMany({
          where: { purchase_id: transfer.purchase_id },
          data: {
            estado: TicketStatus.available,
            user_id: null,
            purchase_id: null,
            reserved_until: null,
          },
        });

        // Registrar log
        await tx.adminLog.create({
          data: {
            admin_id: adminId,
            action: 'reject_transfer',
            payload: JSON.stringify({
              transferId,
              purchaseId: transfer.purchase_id,
              reason: notes,
            }),
          },
        });
      });

      // Enviar email de rechazo
      await sendEmail({
        to: transfer.purchase.user.email,
        subject: 'Transferencia no validada',
        html: getTransferRejectedEmailHtml(
          transfer.purchase.user.nombre,
          transfer.purchase.unique_code,
          notes || 'No se pudo validar tu transferencia. Por favor contacta con soporte.'
        ),
      });

      return NextResponse.json({
        message: 'Transferencia rechazada',
      });
    }
  } catch (error) {
    console.error('Error al validar transferencia:', error);
    return NextResponse.json(
      { error: 'Error al procesar validación' },
      { status: 500 }
    );
  }
}


