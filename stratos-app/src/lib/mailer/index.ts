import nodemailer from "nodemailer";

let _transporter: nodemailer.Transporter | null = null;
let _lastSendAt = 0;

export function getTransporter() {
  if (_transporter) return _transporter;
  _transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE) === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    pool: true,
    maxConnections: 3,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  } as any);
  return _transporter;
}

export async function verifySmtp() {
  const t = getTransporter();
  await t.verify();
  return true;
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
  userId?: string | null;
  emailType?: string;
  unsubscribeUrl?: string;
};

export async function sendEmail(input: SendEmailInput) {
  const now = Date.now();
  const wait = Math.max(0, 1000 - (now - _lastSendAt));
  if (wait) await sleep(wait);

  const fromName = process.env.SMTP_FROM_NAME || "Stratos";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "noreply@example.com";
  let lastError: any = null;
  let providerId: string | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const info = await getTransporter().sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: fromEmail,
        headers: input.unsubscribeUrl ? { "List-Unsubscribe": `<${input.unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined,
      });
      _lastSendAt = Date.now();
      providerId = info.messageId || null;
      return { ok: true, providerId };
    } catch (e: any) {
      lastError = e;
      if (attempt < 3) await sleep(500 * Math.pow(2, attempt - 1));
    }
  }
  return { ok: false, error: String(lastError?.message || lastError) };
}

export function renderBasicEmail(opts: { title: string; preheader?: string; bodyHtml: string; ctaLabel?: string; ctaUrl?: string; unsubscribeUrl?: string }) {
  const brand = "STRATOS";
  const safeTitle = opts.title;
  const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${safeTitle}</title></head>
  <body style="margin:0;background:#0B0D0C;color:#E8ECE6;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="padding:20px 0;border-bottom:1px solid #232925;">
        <div style="font-size:28px;letter-spacing:0.18em;font-weight:700;color:#C8923A;">${brand}</div>
        <div style="color:#8A948B;font-size:12px;margin-top:4px;">Train like an officer.</div>
      </div>
      <div style="padding:24px 0;">
        <h1 style="font-size:22px;margin:0 0 12px 0;color:#E8ECE6;">${safeTitle}</h1>
        <div style="font-size:15px;line-height:1.6;color:#E8ECE6;">${opts.bodyHtml}</div>
        ${opts.ctaUrl ? `<p style="margin-top:20px;"><a href="${opts.ctaUrl}" style="display:inline-block;background:#7A8B4A;color:#0B0D0C;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;">${opts.ctaLabel || "Open Stratos"}</a></p>` : ""}
      </div>
      <div style="padding-top:16px;border-top:1px solid #232925;color:#8A948B;font-size:12px;line-height:1.5;">
        <p>Stratos (local storage mode).</p>
      </div>
    </div>
  </body></html>`;
  const text = `${brand} - ${safeTitle}\n\n${opts.bodyHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}`;
  return { html, text };
}
