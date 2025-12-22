import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    // Si no hay configuración de email, solo logueamos
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.log('📧 Email (simulado) enviado a:', to);
      console.log('📧 Asunto:', subject);
      return { success: true };
    }
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, error };
  }
}

export function getVerificationEmailHtml(nombre: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify?token=${token}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a ${process.env.NEXT_PUBLIC_RAFFLE_NAME}!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Gracias por registrarte en nuestra rifa altruista. Para completar tu registro y poder comprar boletos, por favor verifica tu correo electrónico.</p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verificar mi correo</a>
          </div>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">${verificationUrl}</p>
          <p>Este enlace expirará en 24 horas.</p>
        </div>
        <div class="footer">
          <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getTicketConfirmationEmailHtml(nombre: string, tickets: number[], uniqueCode: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .tickets { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .ticket-number { display: inline-block; background: #22c55e; color: white; padding: 10px 20px; margin: 5px; border-radius: 5px; font-weight: bold; font-size: 18px; }
        .info-box { background: #fff; padding: 15px; border-left: 4px solid #22c55e; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Tu compra ha sido confirmada!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>¡Excelentes noticias! Tu transferencia ha sido validada exitosamente.</p>
          
          <div class="info-box">
            <strong>Folio de compra:</strong> ${uniqueCode}
          </div>
          
          <div class="tickets">
            <h3>Tus números de la suerte:</h3>
            ${tickets.map(num => `<span class="ticket-number">${num.toString().padStart(3, '0')}</span>`).join('')}
          </div>
          
          <h3>Información del sorteo:</h3>
          <ul>
            <li><strong>Premio:</strong> ${process.env.NEXT_PUBLIC_RAFFLE_PRIZE}</li>
            <li><strong>Causa:</strong> ${process.env.NEXT_PUBLIC_RAFFLE_CAUSE}</li>
            <li><strong>Fecha del sorteo:</strong> ${new Date(process.env.NEXT_PUBLIC_DRAW_DATE!).toLocaleDateString('es-MX', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</li>
          </ul>
          
          <p><strong>Reglas importantes:</strong></p>
          <ul>
            <li>El sorteo se realizará de manera transparente y pública</li>
            <li>El ganador será notificado por correo electrónico y teléfono</li>
            <li>Guarda este correo como comprobante de participación</li>
          </ul>
          
          <p>¡Gracias por tu apoyo a nuestra causa! 💚</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getTransferReceivedEmailHtml(nombre: string, tickets: number[], uniqueCode: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: #fff; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏳ Transferencia recibida</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Hemos recibido tu comprobante de transferencia y tus boletos están reservados mientras validamos tu pago.</p>
          
          <div class="info-box">
            <strong>Folio de compra:</strong> ${uniqueCode}<br>
            <strong>Boletos reservados:</strong> ${tickets.join(', ')}
          </div>
          
          <p>Este proceso normalmente toma entre 1-24 horas. Te notificaremos por correo electrónico cuando tu transferencia sea validada.</p>
          
          <p>Mientras tanto, tus boletos están seguros y nadie más puede tomarlos.</p>
          
          <p><strong>Importante:</strong> Si tu transferencia no es validada en 48 horas, por favor contáctanos.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPasswordResetEmailHtml(nombre: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Restablecer contraseña</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Restablecer contraseña</a>
          </div>
          <p>O copia y pega este enlace en tu navegador:</p>
          <p style="background: #fff; padding: 10px; border-radius: 5px; word-break: break-all;">${resetUrl}</p>
          <p>Este enlace expirará en 1 hora.</p>
          <p><strong>Si no solicitaste restablecer tu contraseña, ignora este correo y tu contraseña permanecerá sin cambios.</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getTransferRejectedEmailHtml(nombre: string, uniqueCode: string, reason: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { background: #fff; padding: 15px; border-left: 4px solid #ef4444; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Transferencia no validada</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Lamentamos informarte que tu transferencia con folio <strong>${uniqueCode}</strong> no pudo ser validada.</p>
          
          <div class="warning-box">
            <strong>Motivo:</strong> ${reason}
          </div>
          
          <p>Tus boletos han sido liberados y están nuevamente disponibles.</p>
          
          <p>Si crees que esto es un error o necesitas ayuda, por favor contáctanos.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}


