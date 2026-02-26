/**
 * lib/auth.ts
 *
 * Next.js-compatible authentication helpers.
 * Replaces Express middleware isAuthenticated / authorizeRoles.
 */
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
// Use require() for CommonJS modules
const { redis } = require("../api/utils/redis");

export interface AuthResult {
    user: any;
    error?: NextResponse;
}

/**
 * Verifies the Bearer token from Authorization header and returns the user
 * from Redis. Returns { error: NextResponse } if authentication fails.
 */
export async function authenticate(request: NextRequest): Promise<AuthResult> {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
            user: null,
            error: NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            ),
        };
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY!) as { id: string };
        const userJson = await redis.get(decoded.id);

        if (!userJson) {
            return {
                user: null,
                error: NextResponse.json(
                    { success: false, message: "Unauthorized" },
                    { status: 401 }
                ),
            };
        }

        return { user: JSON.parse(userJson) };
    } catch {
        return {
            user: null,
            error: NextResponse.json(
                { success: false, message: "Invalid Token" },
                { status: 401 }
            ),
        };
    }
}

/**
 * Checks if the authenticated user has one of the specified roles.
 */
export function checkRole(user: any, ...roles: string[]): NextResponse | null {
    if (!roles.includes(user?.role || "")) {
        return NextResponse.json(
            {
                success: false,
                message: `Role: ${user?.role} is not allowed to access this resource`,
            },
            { status: 403 }
        );
    }
    return null;
}
