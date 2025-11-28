const nodemailer = require('nodemailer');

// Validar que las credenciales estén disponibles
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

if (!emailUser || !emailPassword) {
  console.error('⚠️ ADVERTENCIA: Variables de entorno EMAIL_USER o EMAIL_PASSWORD no configuradas');
  console.error('EMAIL_USER:', emailUser ? 'Configurado' : 'NO CONFIGURADO');
  console.error('EMAIL_PASSWORD:', emailPassword ? 'Configurado' : 'NO CONFIGURADO');
}

// Configurar transportador de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword
  }
});

// Función para enviar email de confirmación de pago
async function enviarConfirmacionPago(cliente, pago, auto) {
  try {
    // Validar credenciales antes de enviar
    if (!emailUser || !emailPassword) {
      throw new Error('Credenciales de email no configuradas. Por favor configura EMAIL_USER y EMAIL_PASSWORD en Vercel.');
    }

    const fechaPago = new Date(pago.fechaPago || new Date()).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const mailOptions = {
      from: `"RV Automóviles" <${process.env.EMAIL_USER || 'mateorodriguez1026@gmail.com'}>`,
      to: cliente.email,
      subject: `✅ Pago Confirmado - Cuota #${pago.numeroCuota}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: #1f2937;
            }
            .success-badge {
              background: #10b981;
              color: white;
              padding: 10px 20px;
              border-radius: 25px;
              display: inline-block;
              font-weight: 600;
              margin: 20px 0;
              font-size: 14px;
            }
            .info-box {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: 600;
              color: #6b7280;
            }
            .info-value {
              color: #1f2937;
              font-weight: 500;
              text-align: right;
            }
            .amount-box {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 25px;
              border-radius: 8px;
              text-align: center;
              margin: 25px 0;
            }
            .amount-label {
              font-size: 14px;
              opacity: 0.9;
              margin-bottom: 8px;
            }
            .amount-value {
              font-size: 36px;
              font-weight: 700;
              margin: 0;
            }
            .message {
              color: #4b5563;
              line-height: 1.8;
              margin: 20px 0;
            }
            .footer {
              background: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer-title {
              font-weight: 700;
              color: #1f2937;
              margin: 0 0 5px 0;
            }
            .footer-text {
              color: #6b7280;
              font-size: 13px;
              margin: 5px 0;
            }
            .divider {
              height: 1px;
              background: #e5e7eb;
              margin: 30px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Pago Confirmado!</h1>
              <p>RV Automóviles</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                Estimado/a <strong>${cliente.nombre}</strong>,
              </div>
              
              <div style="text-align: center;">
                <span class="success-badge">✓ PAGO PROCESADO EXITOSAMENTE</span>
              </div>
              
              <p class="message">
                Nos complace confirmar que hemos recibido y procesado correctamente su pago correspondiente a la cuota de su vehículo.
              </p>

              <div class="info-box">
                <div class="info-row">
                  <span class="info-label">Vehículo</span>
                  <span class="info-value">${auto.marca} ${auto.modelo} ${auto.anio}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Matrícula</span>
                  <span class="info-value">${auto.matricula}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Número de Cuota</span>
                  <span class="info-value">#${pago.numeroCuota}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Fecha de Pago</span>
                  <span class="info-value">${fechaPago}</span>
                </div>
              </div>

              <div class="amount-box">
                <div class="amount-label">Monto Pagado</div>
                <div class="amount-value">$${parseFloat(pago.monto).toFixed(2)}</div>
              </div>

              <div class="divider"></div>

              <p class="message">
                Agradecemos su puntualidad y compromiso con sus pagos. Este comprobante es válido como constancia de su transacción.
              </p>

              <p class="message">
                Si tiene alguna consulta o necesita información adicional, no dude en contactarnos.
              </p>
            </div>

            <div class="footer">
              <p class="footer-title">RV Automóviles</p>
              <p class="footer-text">Su concesionario de confianza</p>
              <p class="footer-text" style="margin-top: 15px;">
                Este es un correo automático. Por favor, no responda directamente a este mensaje.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  enviarConfirmacionPago
};
