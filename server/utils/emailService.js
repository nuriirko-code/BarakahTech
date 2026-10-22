const { Resend } = require('resend')

let resendClient = null

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const getFrontendUrl = () => String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')

// The template centralizes responsive inline styles and trusted platform chrome. Dynamic
// values are escaped by callers so names, notes, and announcements cannot inject markup.
const getEmailTemplate = (title, bodyContent) => {
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL || 'support@barakahtech.com'
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:24px 12px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <div style="max-width:600px;margin:0 auto;">
      <header style="padding:20px 24px;background:#15803d;border-radius:10px 10px 0 0;color:#ffffff;font-size:22px;font-weight:700;">
        BarakahTech Academy
      </header>
      <main style="padding:28px 24px;background:#ffffff;border:1px solid #e5e7eb;border-top:0;">
        <h1 style="margin:0 0 18px;color:#14532d;font-size:22px;line-height:1.35;">${escapeHtml(title)}</h1>
        <div style="font-size:15px;line-height:1.7;">${bodyContent}</div>
      </main>
      <footer style="padding:18px 24px;background:#f9fafb;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 10px 10px;color:#6b7280;font-size:12px;line-height:1.6;">
        BarakahTech Academy · Questions? <a href="mailto:${escapeHtml(supportEmail)}" style="color:#15803d;">${escapeHtml(supportEmail)}</a>
      </footer>
    </div>
  </body>
</html>`
}

// Resend is a focused transactional email API that lets a small team send product mail
// without operating SMTP infrastructure; the client is lazy so local development needs no key.
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || /^re_your_key_here$/i.test(apiKey.trim())) return null
  if (!resendClient) resendClient = new Resend(apiKey)
  return resendClient
}

// Email is secondary to the operation that triggered it. Catch and log provider failures
// here so an outage or unconfigured key never rolls back registration, payment, or messaging.
const sendEmail = async ({ to, subject, html }) => {
  try {
    const client = getResendClient()
    const from = process.env.FROM_EMAIL

    // Configure a sender on a domain verified with Resend. A platform-domain sender
    // looks professional and improves deliverability compared with spoofed personal Gmail.
    if (!client || !from || !to) {
      console.warn('Email skipped: configure RESEND_API_KEY, FROM_EMAIL, and a recipient to enable delivery.')
      return false
    }

    const { error } = await client.emails.send({ from, to, subject, html })
    if (error) throw error
    return true
  } catch (error) {
    console.error('Email delivery failed:', error.message || error)
    return false
  }
}

const formatCurrency = (amount, currency = 'ETB') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: String(currency || 'ETB').toUpperCase(),
    }).format(Number(amount) || 0)
  } catch {
    return `${String(currency || 'ETB').toUpperCase()} ${Number(amount) || 0}`
  }
}

const sendWelcomeEmail = async (user) => {
  const roleCopy = user.role === 'pending_teacher'
    ? 'Your teacher application has been submitted. We will review it within 3-5 business days.'
    : 'Start browsing courses and learning today.'
  const body = `<p>Hello ${escapeHtml(user.name)},</p>
    <p>Your account has been created successfully.</p>
    <p>${roleCopy}</p>
    <p><a href="${getFrontendUrl()}" style="color:#15803d;font-weight:700;">Visit BarakahTech Academy</a></p>`

  return sendEmail({
    to: user.email,
    subject: 'Welcome to BarakahTech Academy',
    html: getEmailTemplate('Welcome to BarakahTech Academy', body),
  })
}

const sendTeacherApprovalEmail = async (user, approved, adminNote = '') => {
  const title = approved
    ? 'Congratulations! Your teacher application was approved'
    : 'Update on your BarakahTech teacher application'
  const body = approved
    ? `<p>Hello ${escapeHtml(user.name)},</p><p>Congratulations! Your teacher application was approved. You can now log in and create courses.</p><p><a href="${getFrontendUrl()}/login" style="color:#15803d;font-weight:700;">Log in to your teacher account</a></p>`
    : `<p>Hello ${escapeHtml(user.name)},</p><p>We are unable to approve your teacher application at this time.</p><p><strong>Review note:</strong> ${escapeHtml(adminNote || 'Please contact support for more information.')}</p><p>You are welcome to address the feedback and reapply.</p>`

  return sendEmail({ to: user.email, subject: title, html: getEmailTemplate(title, body) })
}

const sendEnrollmentConfirmationEmail = async (student, course, teacher) => {
  const subject = `You are now enrolled in ${course.title}`
  const body = `<p>Hello ${escapeHtml(student.name)},</p>
    <p>You are enrolled in <strong>${escapeHtml(course.title)}</strong>, taught by ${escapeHtml(teacher?.name || 'your teacher')}.</p>
    <p><a href="${getFrontendUrl()}/learn/${encodeURIComponent(course._id)}" style="color:#15803d;font-weight:700;">Start learning</a></p>`

  return sendEmail({ to: student.email, subject, html: getEmailTemplate(subject, body) })
}

const sendPaymentVerifiedEmail = async (student, course, payment) => {
  const subject = 'Payment verified — Your enrollment is now active'
  const body = `<p>Hello ${escapeHtml(student.name)},</p>
    <p>Your payment for <strong>${escapeHtml(course.title)}</strong> has been verified and your enrollment is active.</p>
    <p><strong>Amount:</strong> ${escapeHtml(formatCurrency(payment.amount, payment.currency))}</p>
    <p><strong>Platform payment code:</strong> ${escapeHtml(payment.platformPaymentCode)}</p>
    <p><a href="${getFrontendUrl()}/learn/${encodeURIComponent(course._id)}" style="color:#15803d;font-weight:700;">Start learning</a></p>`

  return sendEmail({ to: student.email, subject, html: getEmailTemplate(subject, body) })
}

const sendPaymentReceivedNotificationEmail = async (teacher, student, course, payment) => {
  const subject = 'New enrollment in your course'
  const body = `<p>Hello ${escapeHtml(teacher.name)},</p>
    <p>${escapeHtml(student.name)} enrolled in <strong>${escapeHtml(course.title)}</strong>.</p>
    <p><strong>Your recorded earning:</strong> ${escapeHtml(formatCurrency(payment.teacherEarningAmount, payment.currency))}</p>
    <p><a href="${getFrontendUrl()}/dashboard/teacher" style="color:#15803d;font-weight:700;">Open your teacher dashboard</a></p>`

  return sendEmail({ to: teacher.email, subject, html: getEmailTemplate(subject, body) })
}

// Both participants receive the same confirmed-session facts, while the
// dashboard link differs so each person arrives at their own session list.
const sendLiveSessionConfirmedEmails = async (student, tutor, booking) => {
  if (!student || !tutor) return false

  const date = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeZone: booking.timezone || 'UTC',
  }).format(new Date(booking.sessionDate))
  const sessionDetails = `<p><strong>Date:</strong> ${escapeHtml(date)}</p>
    <p><strong>Time:</strong> ${escapeHtml(booking.startTime)} - ${escapeHtml(booking.endTime)} (${escapeHtml(booking.timezone)})</p>
    <p><strong>Duration:</strong> ${escapeHtml(booking.duration)} minutes</p>`
  const trialNote = booking.isTrialSession
    ? '<p>This is a free 30-minute introductory session.</p>'
    : '<p>Your payment has been verified and the session is confirmed.</p>'

  const [studentResult, tutorResult] = await Promise.all([
    sendEmail({
      to: student.email,
      subject: 'Your live tutoring session is confirmed',
      html: getEmailTemplate('Your session is confirmed', `<p>Hello ${escapeHtml(student.name)},</p>${trialNote}${sessionDetails}<p><a href="${getFrontendUrl()}/dashboard/student/my-sessions" style="color:#15803d;font-weight:700;">View your sessions</a></p>`),
    }),
    sendEmail({
      to: tutor.email,
      subject: 'A live tutoring session is confirmed',
      html: getEmailTemplate('Your session is confirmed', `<p>Hello ${escapeHtml(tutor.name)},</p><p>${escapeHtml(student.name)} has a confirmed session with you.</p>${trialNote}${sessionDetails}<p><a href="${getFrontendUrl()}/dashboard/teacher/live-sessions" style="color:#15803d;font-weight:700;">View your sessions</a></p>`),
    }),
  ])

  return studentResult && tutorResult
}

// Message notifications intentionally include no message body: email inboxes can be shared
// or forwarded, while the actual conversation remains behind authenticated platform access.
const sendNewMessageEmail = async (recipient, sender, conversationSubject = '') => {
  const subject = `New message from ${sender.name} on BarakahTech`
  const body = `<p>Hello ${escapeHtml(recipient.name)},</p>
    <p>${escapeHtml(sender.name)} sent you a new message${conversationSubject ? ` about <strong>${escapeHtml(conversationSubject)}</strong>` : ''}.</p>
    <p><a href="${getFrontendUrl()}/messages" style="color:#15803d;font-weight:700;">Open your messages</a></p>`

  return sendEmail({ to: recipient.email, subject, html: getEmailTemplate(subject, body) })
}

const sendPasswordResetEmail = async (user, resetToken) => {
  const subject = 'Reset your BarakahTech password'
  const resetUrl = `${getFrontendUrl()}/reset-password/${encodeURIComponent(resetToken)}`
  const body = `<p>Hello ${escapeHtml(user.name)},</p>
    <p><a href="${resetUrl}" style="color:#15803d;font-weight:700;">Reset your password</a></p>
    <p>This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>`

  return sendEmail({ to: user.email, subject, html: getEmailTemplate(subject, body) })
}

const sendAdminAnnouncementEmail = async (recipients, subject, content) => {
  try {
    const client = getResendClient()
    const from = process.env.FROM_EMAIL
    const recipientList = recipients.filter((recipient) => recipient.email)

    if (!client || !from || recipientList.length === 0) {
      console.warn('Announcement email skipped: configure Resend and valid recipients to enable delivery.')
      return false
    }

    const title = `[BarakahTech] ${subject}`
    const html = getEmailTemplate(title, `<p>${escapeHtml(content).replace(/\n/g, '<br>')}</p>`)
    const emailBatch = recipientList.map((recipient) => ({ from, to: recipient.email, subject: title, html }))

    // Resend's batch endpoint reduces per-recipient overhead when available; small chunks
    // keep broadcasts under provider batch limits. Individual sends are a compatible fallback.
    if (client.batch && typeof client.batch.send === 'function') {
      for (let index = 0; index < emailBatch.length; index += 100) {
        const { error } = await client.batch.send(emailBatch.slice(index, index + 100))
        if (error) throw error
      }
      return true
    }

    const results = await Promise.all(emailBatch.map((email) => sendEmail({
      to: email.to,
      subject: email.subject,
      html: email.html,
    })))
    return results.every(Boolean)
  } catch (error) {
    console.error('Announcement email delivery failed:', error.message || error)
    return false
  }
}

module.exports = {
  sendWelcomeEmail,
  sendTeacherApprovalEmail,
  sendEnrollmentConfirmationEmail,
  sendPaymentVerifiedEmail,
  sendPaymentReceivedNotificationEmail,
  sendLiveSessionConfirmedEmails,
  sendNewMessageEmail,
  sendPasswordResetEmail,
  sendAdminAnnouncementEmail,
}
