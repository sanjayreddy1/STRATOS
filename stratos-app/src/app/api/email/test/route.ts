import { NextRequest, NextResponse } from "next/server";
import { sendEmail, renderBasicEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const to = body?.to || process.env.SMTP_USER;
  if (!to) return NextResponse.json({ ok: false, error: "No recipient email provided and SMTP_USER not set" }, { status: 400 });
  const { html, text } = renderBasicEmail({
    title: "Stratos test email",
    bodyHtml: "<p>This is a test email from your STRATOS setup. If you received this, SMTP is configured correctly.</p>",
    ctaLabel: "Open Dashboard",
    ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
  });
  const result = await sendEmail({ to, subject: "STRATOS: Test email", html, text, emailType: "test" });
  if (!result.ok) return NextResponse.json({ ok: false, error: (result as any).error || "Failed to send" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
