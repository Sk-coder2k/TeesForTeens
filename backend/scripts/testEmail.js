import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ set' : '✗ missing');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log('\nVerifying SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.error('Full error:', error);
  } else {
    console.log('✅ SMTP connection successful! Sending test email...');
    transporter.sendMail({
      from: `"TeesforTeens" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test Email - Newsletter',
      html: '<p>This is a test email from TeesforTeens newsletter system.</p>',
    }, (err, info) => {
      if (err) {
        console.error('❌ Send failed:', err.message);
      } else {
        console.log('✅ Email sent! Message ID:', info.messageId);
      }
    });
  }
});
