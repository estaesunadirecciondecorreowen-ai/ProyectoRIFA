import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { hashFile, validateFolio, validateAmount } from '@/lib/utils';
import { sendEmail, getTransferReceivedEmailHtml } from '@/lib/email';
import { TicketStatus, TransferStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const purchaseId = formData.get('purchaseId') as string;
    const nombreComprador = formData.get('nombreComprador') as string;
    const telefonoComprador = formData.get('telefonoComprador') as string;
    const nombreVendedor = formData.get('nombreVendedor') as string;
    const folio = formData.get('folio') as string;
    const monto = parseFloat(formData.get('monto') as string);
    const fecha = formData.get('fecha') as string;
    const comprobante = formData.get('comprobante') as File;

    // Validaciones
    if (!purchaseId || !folio || !monto || !fecha || !comprobante || !nombreComprador || !telefonoComprador || !nombreVendedor) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar teléfono del comprador
    if (telefonoComprador.length < 10) {
      return NextResponse.json(
        { error: 'El teléfono debe tener al menos 10 dígitos' },
        { status: 400 }
      );
    }

    if (!validateFolio(folio)) {
      return NextResponse.json(
        { error: 'Folio inválido' },
        { status: 400 }
      );
    }

    // Verificar que la compra existe y pertenece al usuario
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        tickets: true,
        user: true,
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra no encontrada' },
        { status: 404 }
      );
    }

    const userId = (session.user as any).id;

    if (purchase.user_id !== userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    if (purchase.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta compra ya fue procesada' },
        { status: 400 }
      );
    }

    // Validar monto
    if (!validateAmount(monto, purchase.total)) {
      return NextResponse.json(
        { error: `El monto debe ser al menos ${purchase.total}` },
        { status: 400 }
      );
    }

    // Verificar que el folio no exista
    const existingTransfer = await prisma.transfer.findUnique({
      where: { folio },
    });

    if (existingTransfer) {
      return NextResponse.json(
        { error: 'Este folio ya fue registrado' },
        { status: 400 }
      );
    }

    // Guardar archivo
    const bytes = await comprobante.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileHash = hashFile(buffer);

    // Verificar hash duplicado
    const existingHash = await prisma.transfer.findUnique({
      where: { comprobante_hash: fileHash },
    });

    if (existingHash) {
      return NextResponse.json(
        { error: 'Este comprobante ya fue registrado' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Crear directorio si no existe
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    const fileName = `${Date.now()}-${comprobante.name}`;
    const filePath = path.join(uploadsDir, fileName);
    const fileUrl = `/uploads/${fileName}`;

    await writeFile(filePath, buffer);

    // Actualizar compra con datos del comprador y vendedor
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { 
        status: 'pending_review',
        comprador_nombre: nombreComprador,
        telefono_comprador: telefonoComprador,
        vendedor_nombre: nombreVendedor,
      },
    });

    // Crear transferencia
    await prisma.transfer.create({
      data: {
        purchase_id: purchaseId,
        folio,
        monto,
        fecha: new Date(fecha),
        comprobante_url: fileUrl,
        comprobante_hash: fileHash,
        status: TransferStatus.pending_review,
      },
    });

    await prisma.ticket.updateMany({
      where: { purchase_id: purchaseId },
      data: { estado: TicketStatus.pending_review },
    });

    // Enviar email (no bloquear si falla)
    try {
      const ticketNumbers = purchase.tickets.map((t) => t.numero);
      await sendEmail({
        to: purchase.user.email,
        subject: 'Transferencia recibida - En proceso de validación',
        html: getTransferReceivedEmailHtml(
          purchase.user.nombre,
          ticketNumbers,
          purchase.unique_code
        ),
      });
    } catch (emailError) {
      console.error('Error al enviar email (no crítico):', emailError);
      // Continuar aunque falle el email
    }

    return NextResponse.json({
      message: 'Transferencia registrada exitosamente. Te notificaremos cuando sea validada.',
    });
  } catch (error) {
    console.error('Error al subir transferencia:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al procesar transferencia' },
      { status: 500 }
    );
  }
}


