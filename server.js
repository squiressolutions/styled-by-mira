import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import nodemailer from 'nodemailer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = process.env.PORT || 3003

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL    || 'Styledbymiraxo@gmail.com'
const GMAIL_USER   = process.env.GMAIL_USER       || 'Styledbymiraxo@gmail.com'
const GMAIL_PASS   = process.env.GMAIL_APP_PASSWORD

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  })
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// ── Contact / Inquiry ─────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, service, message } = req.body

  if (!name || !email || !service) {
    return res.status(400).json({ error: 'Name, email, and service are required.' })
  }

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f9f5f0;padding:32px;border-radius:12px;">
      <div style="background:linear-gradient(135deg,#0a0a0a,#2a1a0a);padding:22px 24px;border-radius:10px;margin-bottom:24px;">
        <h1 style="color:#f9f5f0;margin:0;font-size:22px;letter-spacing:2px;">NEW INQUIRY</h1>
        <p style="color:#b8935a;margin:5px 0 0;font-size:13px;letter-spacing:1px;">Styled by Mira · Personal Styling</p>
      </div>

      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #c8a882;width:38%;font-size:13px;color:#b8935a;font-weight:600;letter-spacing:1px;">CLIENT</td>
          <td style="padding:10px 0;border-bottom:1px solid #c8a882;font-size:14px;color:#0a0a0a;">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #c8a882;font-size:13px;color:#b8935a;font-weight:600;letter-spacing:1px;">EMAIL</td>
          <td style="padding:10px 0;border-bottom:1px solid #c8a882;font-size:14px;"><a href="mailto:${email}" style="color:#b8935a;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #c8a882;font-size:13px;color:#b8935a;font-weight:600;letter-spacing:1px;">PHONE</td>
          <td style="padding:10px 0;border-bottom:1px solid #c8a882;font-size:14px;color:#0a0a0a;">${phone || 'Not provided'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #c8a882;font-size:13px;color:#b8935a;font-weight:600;letter-spacing:1px;">SERVICE</td>
          <td style="padding:10px 0;border-bottom:1px solid #c8a882;font-size:14px;color:#0a0a0a;font-weight:600;">${service}</td>
        </tr>
        ${message ? `<tr>
          <td style="padding:10px 0;font-size:13px;color:#b8935a;font-weight:600;letter-spacing:1px;vertical-align:top;">MESSAGE</td>
          <td style="padding:10px 0;font-size:14px;color:#0a0a0a;">${message}</td>
        </tr>` : ''}
      </table>

      <div style="margin-top:20px;">
        <a href="mailto:${email}?subject=Re: Your Styled by Mira Inquiry&body=Hi ${name},%0A%0AThank you for reaching out about ${service}! I'd love to connect and chat more about your style goals.%0A%0ALooking forward to hearing from you!%0A%0A— Mira%0AStyled by Mira"
          style="display:inline-block;background:#b8935a;color:#f9f5f0;padding:10px 22px;border-radius:2px;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:1px;">
          REPLY TO ${name.toUpperCase().split(' ')[0]} &rarr;
        </a>
      </div>

      <div style="margin-top:20px;padding:12px 16px;background:#0a0a0a;border-radius:4px;text-align:center;">
        <p style="color:#c8a882;font-size:12px;margin:0;letter-spacing:1px;">STYLED BY MIRA · Personal Styling · Styledbymiraxo@gmail.com</p>
      </div>
    </div>
  `

  console.log(`[INQUIRY] ${new Date().toISOString()} | ${name} | ${service} | ${email} | ${phone || 'no phone'}`)

  if (!GMAIL_PASS) {
    console.warn('[INQUIRY] No GMAIL_APP_PASSWORD set — inquiry logged but email not sent.')
    return res.json({ success: true })
  }

  try {
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"Styled by Mira" <${GMAIL_USER}>`,
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `New Inquiry: ${service} — ${name}`,
      html,
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    res.json({ success: true })
  }
})

// ── Catch-all ─────────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Styled by Mira server running on port ${PORT}`)
})
