import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate } from "@/lib/auth";
const { getOrders } = require("@/api/controllers/adroytPaymentController");

export async function GET(request: NextRequest) {
    const { user, error } = await authenticate(request);
    if (error) return error;
    return runController(request, getOrders, { user });
}
