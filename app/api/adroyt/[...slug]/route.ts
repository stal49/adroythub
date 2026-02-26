/**
 * app/api/adroyt/[...slug]/route.ts
 *
 * Handles all Razorpay/adroyt payment routes:
 *   GET  /api/adroyt/check            → service health check
 *   GET  /api/adroyt/orders           → get all Razorpay orders (admin)
 *   GET  /api/adroyt/payments         → get all Razorpay payments (admin)
 *   POST /api/adroyt/create-order     → create Razorpay order
 *   POST /api/adroyt/verify-payment   → verify Razorpay payment
 */
import { NextRequest, NextResponse } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate, checkRole } from "@/lib/auth";

const { createOrder, verifyPayment, getAllOrders, getAllPayments } =
    require("@/api/controllers/adroytPaymentController");

type Context = { params: Promise<{ slug: string[] }> };

export async function GET(request: NextRequest, { params }: Context) {
    const { slug } = await params;
    const path = slug.join("/");

    if (path === "check") {
        return NextResponse.json({
            success: true,
            message: "Payment service is available",
            timestamp: new Date().toISOString(),
        });
    }

    if (path === "orders") {
        const { user, error } = await authenticate(request);
        if (error) return error;
        const roleError = checkRole(user, "admin");
        if (roleError) return roleError;
        return runController(request, getAllOrders, { user });
    }

    if (path === "payments") {
        const { user, error } = await authenticate(request);
        if (error) return error;
        const roleError = checkRole(user, "admin");
        if (roleError) return roleError;
        return runController(request, getAllPayments, { user });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: Context) {
    const { slug } = await params;
    const path = slug.join("/");

    if (path === "create-order") {
        const { user, error } = await authenticate(request);
        if (error) return error;
        return runController(request, createOrder, { user });
    }

    if (path === "verify-payment") {
        const { user, error } = await authenticate(request);
        if (error) return error;
        return runController(request, verifyPayment, { user });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}
