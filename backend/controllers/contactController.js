import ContactMessage from '../models/ContactMessage.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';

const sendViaResend = async ({ to, subject, html }) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TeesforTeens <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${err}`);
  }
  return res.json();
};

// @desc    Submit contact form
// @route   POST /api/contact
export const submitContactForm = async (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Save to DB
  try {
    await ContactMessage.create({ firstName, lastName, email, subject, message });
  } catch (dbErr) {
    console.error('Failed to save contact message:', dbErr.message);
  }

  // Send email via Resend
  try {
    await sendViaResend({
      to: process.env.EMAIL_USER,
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
        </div>
      `,
    });
  } catch (emailErr) {
    console.error('Resend error:', emailErr.message);
    // Message saved to DB, still return success
  }

  res.status(200).json({ message: 'Message sent successfully' });
};

// @desc    Newsletter subscribe
// @route   POST /api/contact/newsletter
export const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(200).json({ message: 'You are already subscribed!' });

    await NewsletterSubscriber.create({ email });

    // Fire and forget
    (async () => {
      try {
        await sendViaResend({
          to: email,
          subject: '🎉 Welcome to TeesforTeens Newsletter!',
          html: `
            <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px">
              <h2 style="color:#29bc89">You're in! 🎉</h2>
              <p>Thanks for subscribing to <strong>TeesforTeens</strong>.</p>
              <ul>
                <li>🔥 New collections & drops</li>
                <li>🏷️ Exclusive discount codes</li>
                <li>🎁 Free giveaways</li>
              </ul>
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
