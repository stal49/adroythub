import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
const { sendStripePublishableKey } = require("@/api/controllers/orderController");

export async function GET(request: NextRequest) {
    return runController(request, sendStripePublishableKey);
}
