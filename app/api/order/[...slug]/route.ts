/**
 * app/api/order/[...slug]/route.ts
 *
 * Handles all order & payment routes:
 *   GET  /api/order/list          → get all orders (admin)
 *   GET  /api/order/stripe-key    → get Stripe publishable key
 *   POST /api/order/create        → create order
 *   POST /api/order/payment       → create payment intent (Stripe)
 */
import { NextRequest, NextResponse } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate, checkRole } from "@/lib/auth";

const { getAllOrders, createOrder, newPayment, sendStripePublishableKey } =
    require("@/api/controllers/orderController");

type Context = { params: Promise<{ slug: string[] }> };

export async function GET(request: NextRequest, { params }: Context) {
    const { slug } = await params;
    const path = slug.join("/");

    if (path === "list") {
        const { user, error } = await authenticate(request);
        if (error) return error;
        const roleError = checkRole(user, "admin");
        if (roleError) return roleError;
        return runController(request, getAllOrders, { user });
    }

    if (path === "stripe-key") {
        return runController(request, sendStripePublishableKey);
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: Context) {
    const { slug } = await params;
    const path = slug.join("/");

    if (path === "create") {
        const { user, error } = await authenticate(request);
        if (error) return error;
        return runController(request, createOrder, { user });
    }

    if (path === "payment") {
        const { user, error } = await authenticate(request);
        if (error) return error;
        return runController(request, newPayment, { user });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}
