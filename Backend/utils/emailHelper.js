// Contenido para: Backend/utils/emailHelper.js

const nodemailer = require('nodemailer');

// Configura el "transportador" de correos.
// Para desarrollo, puedes usar una cuenta de Gmail.
// IMPORTANTE: Para Gmail, necesitas generar una "Contraseña de aplicación"
// en la configuración de seguridad de tu cuenta de Google, no uses tu contraseña normal.
const transporter = nodemailer.createTransport({
    service: 'gmail', // O tu proveedor de email
    auth: {
        user: process.env.EMAIL_USER, // Ej: 'tu.correo@gmail.com'
        pass: process.env.EMAIL_PASS, // La contraseña de aplicación que generaste
    },
});

/**
 * Envía un correo electrónico.
 * @param {string} to - El destinatario.
 * @param {string} subject - El asunto del correo.
 * @param {string} html - El cuerpo del correo en formato HTML.
 */
exports.sendEmail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `"Stocket App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log('Correo de reseteo enviado a:', to);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw new Error('No se pudo enviar el correo de recuperación.');
    }
};