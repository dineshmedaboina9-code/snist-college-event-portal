const nodemailer = require('nodemailer');

const sendEmailNotification = async ({ to, subject, html, text }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[EMAIL SIMULATOR] To: ${to} | Subject: "${subject}"`);
      return { success: true, simulated: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"SNIST Event Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    });

    console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`[EMAIL ERROR] Could not send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmailNotification };
