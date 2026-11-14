import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ ok: true, message: "Cron weekly report disabled in local-storage mode." }); }
