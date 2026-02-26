/**
 * app/api/auth/[...slug]/route.ts
 *
 * Handles all authentication routes:
 *   POST  /api/auth/registration
 *   POST  /api/auth/activate-user
 *   POST  /api/auth/login
 *   POST  /api/auth/social-auth
 *   GET   /api/auth/logout
 *   GET   /api/auth/refresh
 */
import { NextRequest, NextResponse } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate } from "@/lib/auth";

const { registrationUser, activateUser, loginUser, logoutUser, socialAuth, updateAccessToken } =
    require("@/api/controllers/userController");

type Context = { params: Promise<{ slug: string[] }> };

export async function GET(request: NextRequest, { params }: Context) {
    const { slug } = await params;
    const path = slug.join("/");

    if (path === "logout") {
        const { user } = await authenticate(request);
        return runController(request, logoutUser, { user: user ?? undefined });
    }
    if (path === "refresh") {
        return runController(request, updateAccessToken);
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: Context) {
    const { slug } = await params;
    const path = slug.join("/");

    if (path === "registration") return runController(request, registrationUser);
    if (path === "activate-user") return runController(request, activateUser);
    if (path === "login") return runController(request, loginUser);
    if (path === "social-auth") return runController(request, socialAuth);

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}
