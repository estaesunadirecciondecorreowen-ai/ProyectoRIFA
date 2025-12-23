import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { hashFile, validateFolio, validateAmount } from '@/lib/utils';

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
    const comprobante = formData.get('comprobante') as File | null;

    // Validaciones
    if (!purchaseId || !folio || !monto || !fecha || !nombreComprador || !telefonoComprador || !nombreVendedor) {
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
        transfer: true,
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

    // Solo se puede editar si está en pending_review
    if (purchase.status !== 'pending_review') {
      return NextResponse.json(
        { error: 'Solo puedes editar transferencias que están en revisión' },
        { status: 400 }
      );
    }

    if (!purchase.transfer) {
      return NextResponse.json(
        { error: 'No hay transferencia asociada a esta compra' },
        { status: 404 }
      );
    }

    // Validar monto
    if (!validateAmount(monto, purchase.total)) {
      return NextResponse.json(
        { error: `El monto debe ser al menos ${purchase.total}` },
        { status: 400 }
      );
    }

    // Verificar que el folio no exista (excepto si es el mismo)
    if (folio !== purchase.transfer.folio) {
      const existingTransfer = await prisma.transfer.findUnique({
        where: { folio },
      });

      if (existingTransfer) {
        return NextResponse.json(
          { error: 'Este folio ya fue registrado' },
          { status: 400 }
        );
      }
    }

    let fileUrl = purchase.transfer.comprobante_url;
    let fileHash = purchase.transfer.comprobante_hash;

    // Si se subió un nuevo comprobante
    if (comprobante && comprobante.size > 0) {
      const bytes = await comprobante.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const newFileHash = hashFile(buffer);

      // Verificar hash duplicado (excepto si es el mismo archivo)
      if (newFileHash !== purchase.transfer.comprobante_hash) {
        const existingHash = await prisma.transfer.findUnique({
          where: { comprobante_hash: newFileHash },
        });

        if (existingHash) {
          return NextResponse.json(
            { error: 'Este comprobante ya fue registrado' },
            { status: 400 }
          );
        }
      }

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Crear directorio si no existe
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Eliminar archivo anterior si existe
      if (purchase.transfer.comprobante_url) {
        const oldFilePath = path.join(process.cwd(), 'public', purchase.transfer.comprobante_url);
        if (existsSync(oldFilePath)) {
          try {
            await unlink(oldFilePath);
          } catch (error) {
            console.error('Error eliminando archivo anterior:', error);
          }
        }
      }

      const fileName = `${Date.now()}-${comprobante.name}`;
      const filePath = path.join(uploadsDir, fileName);
      fileUrl = `/uploads/${fileName}`;

      await writeFile(filePath, buffer);
      fileHash = newFileHash;
    }

    // Actualizar compra
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { 
        comprador_nombre: nombreComprador,
        telefono_comprador: telefonoComprador,
        vendedor_nombre: nombreVendedor,
      },
    });

    // Actualizar transferencia
    await prisma.transfer.update({
      where: { id: purchase.transfer.id },
      data: {
        folio,
        monto,
        fecha: new Date(fecha),
        comprobante_url: fileUrl,
        comprobante_hash: fileHash,
      },
    });

    return NextResponse.json({
      message: 'Transferencia actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar transferencia:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar transferencia' },
      { status: 500 }
    );
  }
}

