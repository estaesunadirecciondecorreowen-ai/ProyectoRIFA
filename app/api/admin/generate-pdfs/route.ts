import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import archiver from 'archiver';
import { Readable } from 'stream';

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

    const fullUrl = `${apiUrl}?${params.toString()}`;
    console.log('🔗 Llamando a API externa:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    console.log('📊 Status de API externa:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error de API externa:', errorText);
      throw new Error(`Error al generar PDFs en la API externa: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ API Response COMPLETA:', JSON.stringify(result, null, 2));
    
    // La API puede devolver { tickets: [...] } o { success: true, tickets: [...] }
    let files = result.tickets || result.files || result.data || [];
    console.log('📋 Archivos extraídos de la respuesta:', files);
    console.log('📋 Tipo de archivos:', typeof files);
    
    // Convertir a array si es necesario
    if (typeof files === 'string') {
      files = files.split(',').map((f: string) => f.trim()).filter((f: string) => f);
      console.log('📋 Archivos después de split:', files);
    }
    if (!Array.isArray(files)) {
      files = [files];
    }
    
    // Filtrar archivos vacíos o inválidos
    files = files.filter((f: any) => f && typeof f === 'string' && f.trim().length > 0);
    console.log('📋 Archivos válidos finales:', files);

    if (files.length === 0) {
      console.error('❌ No se encontraron archivos en la respuesta de la API');
      console.error('❌ Respuesta completa:', result);
      return NextResponse.json(
        { 
          error: 'La API externa no generó archivos PDF',
          apiResponse: result
        },
        { status: 500 }
      );
    }

    // IMPORTANTE: No intentar descargar si los archivos no tienen la extensión correcta
    const invalidFiles = files.filter((f: any) => !f.endsWith('.pdf'));
    if (invalidFiles.length > 0) {
      console.warn('⚠️ Archivos sin extensión .pdf:', invalidFiles);
    }

    // Descargar el ZIP
    const downloadUrl =
      'https://tickets-fqbvdgbeewbedkfs.centralus-01.azurewebsites.net/download';
    const downloadParams = new URLSearchParams({
      files: files.join(','),
    });

    const fullDownloadUrl = `${downloadUrl}?${downloadParams.toString()}`;
    console.log('📥 URL de descarga construida:', fullDownloadUrl);
    console.log('📋 Lista de archivos a descargar:', files.join(', '));

    const downloadResponse = await fetch(fullDownloadUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/zip, application/octet-stream, */*',
      },
    });

    console.log('📊 Status de descarga:', downloadResponse.status, downloadResponse.statusText);
    console.log('📋 Content-Type de respuesta:', downloadResponse.headers.get('content-type'));
    console.log('📏 Content-Length de respuesta:', downloadResponse.headers.get('content-length'));

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text();
      console.error('❌ Error al descargar ZIP:', errorText);
      throw new Error(`Error al descargar PDFs: ${downloadResponse.status} - ${errorText}`);
    }

    // Descargar el archivo completo
    const arrayBuffer = await downloadResponse.arrayBuffer();
    console.log('📦 ArrayBuffer recibido, tamaño:', arrayBuffer.byteLength, 'bytes');
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('El archivo descargado está vacío');
    }
    
    const downloadedBuffer = Buffer.from(arrayBuffer);
    console.log('💾 Buffer creado, tamaño:', downloadedBuffer.length, 'bytes');
    
    // Verificar qué tipo de archivo es (ZIP o PDF)
    const signature = downloadedBuffer.toString('hex', 0, 2);
    console.log('🔍 Firma del archivo:', signature);
    
    let zipBuffer;
    let zipFilename;
    
    if (signature === '504b') {
      // Es un ZIP
      console.log('✅ Es un archivo ZIP válido');
      zipBuffer = downloadedBuffer;
      zipFilename = `boletos_${Date.now()}.zip`;
    } else if (signature === '2550') {
      // Es un PDF individual (firma %PDF = 0x2550)
      console.log('✅ Es un archivo PDF individual');
      console.log('📦 Convirtiendo PDF a ZIP...');
      
      // Crear un ZIP con el PDF individual
      const chunks: Buffer[] = [];
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      
      const archivePromise = new Promise((resolve, reject) => {
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);
      });
      
      // Agregar el PDF al ZIP
      const pdfFilename = files[0]; // El nombre del archivo PDF
      archive.append(downloadedBuffer, { name: pdfFilename });
      await archive.finalize();
      
      zipBuffer = await archivePromise as Buffer;
      zipFilename = `boletos_${Date.now()}.zip`;
      console.log('✅ ZIP creado exitosamente, tamaño:', zipBuffer.length, 'bytes');
    } else {
      console.error('❌ Tipo de archivo desconocido. Firma:', signature);
      console.error('Primeros 32 bytes:', downloadedBuffer.toString('hex', 0, 32));
      throw new Error(`Tipo de archivo desconocido (firma: ${signature})`);
    }

    // Guardar el ZIP en el servidor
    const ticketsPdfDir = path.join(process.cwd(), 'tickets_pdf');
    
    // Crear carpeta si no existe
    if (!existsSync(ticketsPdfDir)) {
      await mkdir(ticketsPdfDir, { recursive: true });
      console.log('📁 Carpeta tickets_pdf creada');
    }
    
    const zipPath = path.join(ticketsPdfDir, zipFilename);
    console.log('💾 Guardando en:', zipPath);

    try {
      await writeFile(zipPath, zipBuffer);
      console.log('ZIP guardado exitosamente en:', zipPath);
    } catch (writeError) {
      console.error('Error al guardar ZIP:', writeError);
      throw new Error('Error al guardar el archivo ZIP');
    }

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
    console.error('❌ Error completo al generar PDFs:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Error desconocido al generar PDFs',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}

