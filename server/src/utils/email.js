import { Resend } from 'resend';
import env from '../config/env.js';

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const buildPlainTextFromHtml = (html = '') =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const buildContactEmailHtml = ({ name, email, subject, message }) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Contact Message - Maktabatul Huda</title>
  </head>
  <body style="margin:0;padding:0;background:#f8f5f0;font-family:Arial,Helvetica,sans-serif;color:#14532d;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f5f0;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5eee8;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#0f766e;padding:24px;text-align:center;">
                <div style="font-size:22px;font-weight:700;color:#ffffff;">Maktabatul Huda</div>
                <div style="margin-top:6px;font-size:12px;color:#d4af37;letter-spacing:.08em;text-transform:uppercase;">New contact message</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 8px;">
                <h1 style="margin:0;color:#14532d;font-size:24px;line-height:1.25;">${safeSubject}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 18px;font-size:15px;line-height:1.7;color:#374151;">
                <p style="margin:0 0 4px;"><strong>Name:</strong> ${safeName}</p>
                <p style="margin:0;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#0f766e;">${safeEmail}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 32px;">
                <div style="border-left:4px solid #d4af37;background:#f8f5f0;border-radius:8px;padding:18px 20px;color:#374151;font-size:15px;line-height:1.7;">
                  ${safeMessage}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const sendPasswordResetEmail = async (to, resetUrl) => {
  if (!resend) {
    console.info(`Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.mailFrom,
    to: [to],
    subject: 'Reset your Maktabatul Huda password',
    text: `Use this link to reset your password. It expires in 1 hour: ${resetUrl}`,
    html: `<p>Use this link to reset your password. It expires in 1 hour:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  if (error) {
    throw new Error(error.message || 'Unable to send password reset email');
  }
};

export const buildNewsletterEmailHtml = ({
  subject,
  content,
  unsubscribeUrl = '#',
  libraryUrl = env.frontendUrl,
}) => {
  const safeSubject = escapeHtml(subject);
  const safeLibraryUrl = escapeHtml(libraryUrl);
  const safeUnsubscribeUrl = escapeHtml(unsubscribeUrl);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${safeSubject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f8f5f0;font-family:Arial,Helvetica,sans-serif;color:#14532d;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f5f0;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5eee8;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#0f766e;padding:24px;text-align:center;">
                <div style="font-size:22px;font-weight:700;color:#ffffff;">Maktabatul Huda</div>
                <div style="margin-top:6px;font-size:12px;color:#d4af37;letter-spacing:.08em;text-transform:uppercase;">Seeking beneficial knowledge</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 8px;">
                <h1 style="margin:0;color:#14532d;font-size:26px;line-height:1.25;">${safeSubject}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 12px;font-size:16px;line-height:1.7;color:#374151;">
                ${content}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:12px 24px 32px;">
                <a href="${safeLibraryUrl}" style="display:inline-block;background:#d4af37;color:#14532d;text-decoration:none;font-weight:700;border-radius:8px;padding:12px 18px;">Visit Maktabatul Huda</a>
              </td>
            </tr>
            <tr>
              <td style="background:#f3f7f4;padding:18px 24px;text-align:center;font-size:12px;line-height:1.6;color:#6b7280;">
                You are receiving this email because you subscribed to Maktabatul Huda updates.<br>
                <a href="${safeUnsubscribeUrl}" style="color:#0f766e;text-decoration:underline;">Unsubscribe</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const sendNewsletterEmail = async ({ to, subject, content, unsubscribeUrl }) => {
  if (!resend) {
    console.info(`Newsletter email for ${to}: ${subject}`);
    return;
  }

  const html = buildNewsletterEmailHtml({ subject, content, unsubscribeUrl });
  const { error } = await resend.emails.send({
    from: env.mailFrom,
    to: [to],
    subject,
    text: `${subject}\n\n${buildPlainTextFromHtml(content)}\n\nUnsubscribe: ${unsubscribeUrl}`,
    html,
  });

  if (error) {
    throw new Error(error.message || 'Unable to send newsletter email');
  }
};

export const sendContactEmail = async ({ to, name, email, subject, message }) => {
  const emailSubject = `[Contact] ${subject}`;
  const text = `Name: ${name}
Email: ${email}

Message:

${message}`;

  if (!resend) {
    console.info(`Contact email to ${to}: ${emailSubject}\n${text}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: env.mailFrom,
    to: [to],
    replyTo: email,
    subject: emailSubject,
    text,
    html: buildContactEmailHtml({ name, email, subject, message }),
  });

  if (error) {
    throw new Error(error.message || 'Unable to send contact email');
  }
};
