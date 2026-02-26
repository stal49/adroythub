import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        success: true,
        message: "Payment service is available",
        timestamp: new Date().toISOString(),
    });
}
