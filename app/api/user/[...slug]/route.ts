/**
 * app/api/user/[...slug]/route.ts
 *
 * Handles all user profile & admin user management routes:
 *   GET    /api/user/list               → get all users (admin)
 *   PUT    /api/user/update-avatar      → update profile picture
 *   PUT    /api/user/update-info        → update name
 *   PUT    /api/user/update-password    → change password
 *   PUT    /api/user/update-role        → change user role (admin)
 *   DELETE /api/user/delete/:id         → delete user (admin)
 */
import { NextRequest, NextResponse } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate, checkRole } from "@/lib/auth";

const {
    updateProfilePicture,
    updateUserInfo,
    updatePassword,
    updateUserRole,
    getAllUsers,
    deleteUser,
} = require("@/api/controllers/userController");

type Context = { params: Promise<{ slug: string[] }> };

async function requireAuth(request: NextRequest) {
    const { user, error } = await authenticate(request);
    return { user, error };
}

export async function GET(request: NextRequest, { params }: Context) {
    const { slug } = await params;
    const path = slug.join("/");

    if (path === "list") {
        const { user, error } = await requireAuth(request);
        if (error) return error;
        const roleError = checkRole(user, "admin");
        if (roleError) return roleError;
        return runController(request, getAllUsers, { user });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: Context) {
    const { slug } = await params;
    const path = slug[0];

    const { user, error } = await requireAuth(request);
    if (error) return error;

    if (path === "update-avatar") return runController(request, updateProfilePicture, { user });
    if (path === "update-info") return runController(request, updateUserInfo, { user });
    if (path === "update-password") return runController(request, updatePassword, { user });

    if (path === "update-role") {
        const roleError = checkRole(user, "admin");
        if (roleError) return roleError;
        return runController(request, updateUserRole, { user });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function DELETE(request: NextRequest, { params }: Context) {
    const { slug } = await params;
    // slug = ["delete", "<id>"]
    if (slug[0] === "delete" && slug[1]) {
        const { user, error } = await requireAuth(request);
        if (error) return error;
        const roleError = checkRole(user, "admin");
        if (roleError) return roleError;
        return runController(request, deleteUser, { user, params: { id: slug[1] } });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}
