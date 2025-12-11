import nodemailer from 'nodemailer';

const transporter =
  process.env.SMTP_HOST && process.env.SMTP_USER
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
    : null;

export const sendEmail = async ({ to, subject, text }) => {
  if (!transporter) {
    console.log('[email:dev] skipping send', { to, subject, text });
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'noreply@example.com',
    to,
    subject,
    text,
  });
};


