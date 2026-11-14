import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ ok: true, message: "Cron reminders disabled in local-storage mode (no server database)." }); }
