import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { readFile } from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { Readable } from 'stream';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get('purchaseId');

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'ID de compra requerido' },
        { status: 400 }
      );
    }

    const userId = (session.user as any).id;

    // Verificar que la compra pertenece al usuario
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        tickets: {
          where: {
            pdf_generado: true,
          },
          orderBy: {
            numero: 'asc',
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: 'Compra no encontrada' },
        { status: 404 }
      );
    }

    if (purchase.user_id !== userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    if (purchase.status !== 'approved') {
      return NextResponse.json(
        { error: 'La compra aún no ha sido aprobada' },
        { status: 400 }
      );
    }

    if (purchase.tickets.length === 0) {
      return NextResponse.json(
        { error: 'No hay boletos con PDF generado' },
        { status: 404 }
      );
    }

    // Si todos los tickets tienen el mismo pdf_filename, es un ZIP que ya existe
    const pdfFilenames = [...new Set(purchase.tickets.map(t => t.pdf_filename).filter(Boolean))];
    
    console.log('PDFs encontrados:', pdfFilenames);
    console.log('Tickets con PDF:', purchase.tickets.map(t => ({ numero: t.numero, pdf_generado: t.pdf_generado, pdf_filename: t.pdf_filename })));
    
    if (pdfFilenames.length === 0) {
      return NextResponse.json(
        { error: 'Los PDFs aún no han sido generados. Contacta al administrador.' },
        { status: 404 }
      );
    }
    
    if (pdfFilenames.length === 1 && pdfFilenames[0]) {
      // Descargar el ZIP existente
      const zipPath = path.join(process.cwd(), 'tickets_pdf', pdfFilenames[0]);
      
      console.log('Intentando leer ZIP de:', zipPath);
      
      try {
        const fileBuffer = await readFile(zipPath);
        
        console.log('ZIP leído exitosamente, tamaño:', fileBuffer.length);
        
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="mis_boletos_${purchase.unique_code}.zip"`,
            'Content-Length': fileBuffer.length.toString(),
          },
        });
      } catch (error) {
        console.error('Error leyendo archivo ZIP:', error);
        return NextResponse.json(
          { error: `Archivo no encontrado: ${pdfFilenames[0]}. Contacta al administrador para regenerar los PDFs.` },
          { status: 500 }
        );
      }
    }

    // Si hay múltiples archivos o PDFs individuales, crear un nuevo ZIP
    // (Esta funcionalidad se puede implementar más adelante si es necesario)
    return NextResponse.json(
      { error: 'Funcionalidad de descarga múltiple no implementada aún' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error al descargar boletos:', error);
    return NextResponse.json(
      { error: 'Error al descargar boletos' },
      { status: 500 }
    );
  }
}

