import { NextResponse } from "next/server";
import { verifySmtp } from "@/lib/mailer";

export async function GET() {
  try {
    await verifySmtp();
    return NextResponse.json({ ok: true, message: "SMTP connection verified" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
