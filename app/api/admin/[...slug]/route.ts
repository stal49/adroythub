/**
 * app/api/admin/[...slug]/route.ts
 *
 * Handles all admin-only routes:
 *   GET  /api/admin/analytics/courses         → courses analytics
 *   GET  /api/admin/analytics/users           → users analytics
 *   GET  /api/admin/analytics/orders          → orders analytics
 *   GET  /api/admin/layout/:type              → get layout by type
 *   GET  /api/admin/notifications             → get all notifications
 *   POST /api/admin/layout/create             → create layout
 *   PUT  /api/admin/layout/edit               → edit layout
 *   PUT  /api/admin/notification/:id          → update notification status
 */
import { NextRequest, NextResponse } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate, checkRole } from "@/lib/auth";

const { getCoursesAnalytics, getUsersAnalytics, getOrdersAnalytics } =
    require("@/api/controllers/analyticsController");
const { getLayoutByType, createLayout, editLayout } =
    require("@/api/controllers/layoutController");
const { getAllNotification, updateNotification } =
    require("@/api/controllers/notificationController");

type Context = { params: Promise<{ slug: string[] }> };

async function adminAuth(request: NextRequest) {
    const { user, error } = await authenticate(request);
    if (error) return { user: null, authError: error };
    const roleError = checkRole(user, "admin");
    if (roleError) return { user: null, authError: roleError };
    return { user, authError: null };
}

export async function GET(request: NextRequest, { params }: Context) {
    const { slug } = await params;
    const path = slug.join("/");

    const { user, authError } = await adminAuth(request);
    if (authError) return authError;

    if (path === "analytics/courses") return runController(request, getCoursesAnalytics, { user });
    if (path === "analytics/users") return runController(request, getUsersAnalytics, { user });
    if (path === "analytics/orders") return runController(request, getOrdersAnalytics, { user });
    if (path === "notifications") return runController(request, getAllNotification, { user });

    // GET /api/admin/layout/:type
    if (slug[0] === "layout" && slug[1] && slug[1] !== "create" && slug[1] !== "edit") {
        return runController(request, getLayoutByType, { user, params: { type: slug[1] } });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: Context) {
    const { slug } = await params;
    const path = slug.join("/");

    const { user, authError } = await adminAuth(request);
    if (authError) return authError;

    if (path === "layout/create") return runController(request, createLayout, { user });

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: Context) {
    const { slug } = await params;

    const { user, authError } = await adminAuth(request);
    if (authError) return authError;

    // PUT /api/admin/layout/edit
    if (slug[0] === "layout" && slug[1] === "edit") {
        return runController(request, editLayout, { user });
    }

    // PUT /api/admin/notification/:id
    if (slug[0] === "notification" && slug[1]) {
        return runController(request, updateNotification, { user, params: { id: slug[1] } });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}
