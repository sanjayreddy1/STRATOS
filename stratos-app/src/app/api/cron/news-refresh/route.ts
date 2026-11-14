import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ ok: true, message: "Cron news refresh disabled in local-storage mode. Use /api/news from client." }); }
