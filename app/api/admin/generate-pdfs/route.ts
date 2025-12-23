import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

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

    const { boletos, template = 'negro', associate = true } = await request.json();

    if (!boletos || !Array.isArray(boletos) || boletos.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos un número de boleto' },
        { status: 400 }
      );
    }

    // Verificar que todos los boletos existen y están vendidos
    const tickets = await prisma.ticket.findMany({
      where: {
        numero: { in: boletos },
      },
    });

    if (tickets.length !== boletos.length) {
      return NextResponse.json(
        { error: 'Algunos boletos no existen' },
        { status: 400 }
      );
    }

    const notSold = tickets.filter(
      (t) => t.estado !== 'sold' && t.estado !== 'sold_physical'
    );

    if (notSold.length > 0) {
      return NextResponse.json(
        {
          error: `Los siguientes boletos no están vendidos: ${notSold
            .map((t) => t.numero)
            .join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Llamar a la API externa para generar PDFs
    const apiUrl = 'https://tickets-fqbvdgbeewbedkfs.centralus-01.azurewebsites.net/ticket';
    const params = new URLSearchParams({
      numbers: boletos.join(','),
      template,
      associate: associate.toString(),
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al generar PDFs en la API externa');
    }

    const result = await response.json();
    console.log('API Response:', result);
    
    // Convertir a array si es necesario
    let files = result.tickets || [];
    if (typeof files === 'string') {
      files = files.split(',');
    }
    if (!Array.isArray(files)) {
      files = [files];
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No se generaron archivos PDF' },
        { status: 500 }
      );
    }

    // Descargar el ZIP
    const downloadUrl =
      'https://tickets-fqbvdgbeewbedkfs.centralus-01.azurewebsites.net/download';
    const downloadParams = new URLSearchParams({
      files: Array.isArray(files) ? files.join(',') : files.toString(),
    });

    const downloadResponse = await fetch(`${downloadUrl}?${downloadParams.toString()}`, {
      method: 'GET',
    });

    if (!downloadResponse.ok) {
      throw new Error('Error al descargar PDFs');
    }

    const zipBuffer = Buffer.from(await downloadResponse.arrayBuffer());

    // Guardar el ZIP en el servidor
    const timestamp = Date.now();
    const zipFilename = `boletos_${timestamp}.zip`;
    const ticketsPdfDir = path.join(process.cwd(), 'tickets_pdf');
    const zipPath = path.join(ticketsPdfDir, zipFilename);

    await writeFile(zipPath, zipBuffer);

    // Actualizar los boletos con la información del PDF
    await prisma.ticket.updateMany({
      where: {
        numero: { in: boletos },
      },
      data: {
        pdf_generado: true,
        pdf_filename: zipFilename,
      },
    });

    return NextResponse.json({
      message: `PDFs generados exitosamente para ${boletos.length} boleto(s)`,
      filename: zipFilename,
      tickets: boletos,
    });
  } catch (error) {
    console.error('Error al generar PDFs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al generar PDFs' },
      { status: 500 }
    );
  }
}

