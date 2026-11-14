import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ ok: true, message: "Cron daily brief disabled in local-storage mode." }); }
