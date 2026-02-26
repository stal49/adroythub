import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate } from "@/lib/auth";
const { newPayment } = require("@/api/controllers/orderController");

export async function POST(request: NextRequest) {
    const { user, error } = await authenticate(request);
    if (error) return error;
    return runController(request, newPayment, { user });
}
