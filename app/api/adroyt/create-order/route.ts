import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate } from "@/lib/auth";
const { createOrder } = require("@/api/controllers/adroytPaymentController");

export async function POST(request: NextRequest) {
    const { user, error } = await authenticate(request);
    if (error) return error;
    return runController(request, createOrder, { user });
}
