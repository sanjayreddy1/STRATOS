import { NextResponse } from "next/server";
export async function GET() { return new NextResponse("Unsubscribe endpoint is not applicable in local-storage mode.", { status: 200 }); }
