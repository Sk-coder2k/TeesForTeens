import nodemailer from 'nodemailer';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import ContactMessage from '../models/ContactMessage.js';

const createTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @desc    Newsletter subscribe
// @route   POST /api/contact/newsletter
export const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(200).json({ message: 'You are already subscribed!' });

    await NewsletterSubscriber.create({ email });

    (async () => {
      try {
        const transporter = createTransporter();
        await transporter.sendMail({
          from: `"TeesforTeens" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER,
          subject: 'New Newsletter Subscriber',
          html: `<p><strong>${email}</strong> just subscribed to the TeesforTeens newsletter.</p>`,
        });
        await transporter.sendMail({
          from: `"TeesforTeens" <${process.env.EMAIL_USER}>`,
          to: email,
          replyTo: process.env.EMAIL_USER,
          subject: '🎉 Welcome to TeesforTeens Newsletter!',
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
              <h2 style="color:#29bc89">You're in! 🎉</h2>
              <p>Thanks for subscribing to <strong>TeesforTeens</strong>.</p>
              <ul>
                <li>🔥 New collections &amp; drops</li>
                <li>🏷️ Exclusive discount codes</li>
                <li>🎁 Free giveaways</li>
              </ul>
              <p style="margin-top:24px;color:#9ca3af;font-size:12px">TeesforTeens — Designed for the modern generation.</p>
            </div>
          `,
        });
      } catch (e) {
        console.error('Newsletter email error:', e.message);
      }
    })();

    res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error) {
    if (error.code === 11000) return res.status(200).json({ message: 'You are already subscribed!' });
    res.status(500).json({ message: 'Failed to subscribe. Please try again.' });
  }
};

// @desc    Submit contact form
// @route   POST /api/contact
export const submitContactForm = async (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    await ContactMessage.create({ firstName, lastName, email, subject, message });
  } catch (dbErr) {
    console.error('Failed to save contact message:', dbErr.message);
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"TeesforTeens Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Message: ${subject || 'General Inquiry'} — from ${firstName} ${lastName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#29bc89;margin-top:0">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#6b7280;width:100px">Name</td><td style="padding:8px 0;font-weight:bold">${firstName} ${lastName}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Subject</td><td style="padding:8px 0">${subject || 'General Inquiry'}</td></tr>
          </table>
          <hr style="margin:16px 0;border-color:#f3f4f6">
          <h4 style="color:#374151">Message:</h4>
          <p style="background:#f9fafb;padding:16px;border-radius:8px;line-height:1.6">${message.replace(/\n/g, '<br>')}</p>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">Hit reply to respond directly to ${firstName}.</p>
        </div>
      `,
    });
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (emailErr) {
    console.error('Gmail error:', emailErr.message);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
};
