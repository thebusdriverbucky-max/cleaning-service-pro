type EmailPayload = {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailPayload) {
  // Support: Resend (recommended), Nodemailer/SMTP, or console fallback

  // --- OPTION A: Resend ---
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: from || process.env.EMAIL_FROM || 'CleanFlow <noreply@cleanflow.com>',
      to,
      subject,
      html,
    })
    return
  }

  // --- OPTION B: SMTP via Nodemailer ---
  if (process.env.SMTP_HOST) {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    await transporter.sendMail({
      from: from || process.env.EMAIL_FROM || 'CleanFlow <noreply@cleanflow.com>',
      to,
      subject,
      html,
    })
    return
  }

  // --- FALLBACK: Console log (development) ---
  console.log('📧 [EMAIL - no provider configured]')
  console.log('To:', to)
  console.log('Subject:', subject)
  console.log('Body preview:', html.replace(/<[^>]+>/g, '').slice(0, 200))
}
