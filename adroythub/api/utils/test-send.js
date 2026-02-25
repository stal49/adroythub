require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Test" <${process.env.SMTP_MAIL}>`,
      to: 'calmchase.pratik@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email from nodemailer.',
    });

    console.log('Test email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
}

testEmail();
