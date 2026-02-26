/**
 * lib/expressAdapter.ts
 *
 * Adapts Express-style (req, res, next) controller functions to work within
 * Next.js App Router route handlers. Controllers in api/controllers/ are called
 * with a mock Express req/res, and the response is captured + returned as a
 * NextResponse.
 */
import { NextRequest, NextResponse } from "next/server";

type ExpressController = (req: any, res: any, next: any) => void | Promise<void>;

export interface AdapterOptions {
    /** Dynamic route params (e.g. { id: "abc123" }) - can be a Promise in Next.js 15+ */
    params?: Promise<Record<string, string>> | Record<string, string>;
    /** Authenticated user to attach to req.user */
    user?: any;
}

/**
 * Converts a NextRequest into a mock Express req object.
 */
function buildExpressReq(request: NextRequest, body: any, options: AdapterOptions & { params?: Record<string, string> }) {
    const url = new URL(request.url);
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
        query[key] = value;
    });

    // Parse cookies from the Cookie header
    const cookies: Record<string, string> = {};
    const cookieHeader = request.headers.get("cookie") || "";
    cookieHeader.split(";").forEach((part) => {
        const [key, ...rest] = part.trim().split("=");
        if (key) cookies[key.trim()] = rest.join("=").trim();
    });

    return {
        body,
        query,
        params: options.params || {},
        headers: Object.fromEntries(request.headers.entries()),
        cookies,
        user: options.user || null,
        method: request.method,
        url: request.url,
        path: url.pathname,
    };
}

/**
 * Creates a mock Express res object that captures calls to json(), status(), etc.
 * Resolves a promise when the response is "sent".
 */
function buildExpressRes(): { res: any; promise: Promise<NextResponse> } {
    let resolve!: (r: NextResponse) => void;
    const promise = new Promise<NextResponse>((res) => {
        resolve = res;
    });

    let statusCode = 200;
    const setCookies: { name: string; value: string; options: any }[] = [];
    const resHeaders: Record<string, string> = {};

    const res = {
        status(code: number) {
            statusCode = code;
            return res;
        },
        json(data: any) {
            const response = NextResponse.json(data, {
                status: statusCode,
                headers: resHeaders,
            });
            // Apply Set-Cookie headers
            setCookies.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
            });
            resolve(response);
        },
        send(data: any) {
            const body = typeof data === "string" ? data : JSON.stringify(data);
            const response = new NextResponse(body, {
                status: statusCode,
                headers: { "Content-Type": "application/json", ...resHeaders },
            });
            setCookies.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
            });
            resolve(response);
        },
        sendStatus(code: number) {
            statusCode = code;
            const response = new NextResponse(null, { status: code });
            resolve(response);
        },
        cookie(name: string, value: string, options: any = {}) {
            setCookies.push({ name, value, options });
            return res;
        },
        setHeader(name: string, value: string) {
            resHeaders[name] = value;
            return res;
        },
        header(name: string, value: string) {
            resHeaders[name] = value;
            return res;
        },
        end(body?: string) {
            const response = new NextResponse(body || null, { status: statusCode });
            resolve(response);
        },
    };

    return { res, promise };
}

/**
 * Runs an Express-style controller inside a Next.js route handler context.
 *
 * Usage:
 *   export async function POST(request: NextRequest) {
 *     return runController(request, myController, { user: authenticatedUser });
 *   }
 */
export async function runController(
    request: NextRequest,
    controller: ExpressController,
    options: AdapterOptions = {}
): Promise<NextResponse> {
    // Next.js 15+: params is a Promise — await it if needed
    const resolvedParams = options.params
        ? await Promise.resolve(options.params)
        : {};
    let body: any = {};
    try {
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            body = await request.json();
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
            const text = await request.text();
            const params = new URLSearchParams(text);
            params.forEach((value, key) => {
                body[key] = value;
            });
        }
    } catch {
        // Body parsing failed — keep body as empty object
    }

    const req = buildExpressReq(request, body, { ...options, params: resolvedParams });
    const { res, promise } = buildExpressRes();

    // next() — in case middleware calls next() with an error
    const next = (err?: any): void => {
        if (err) {
            const statusCode = err.statusCode || 500;
            const message = err.message || "Internal Server Error";
            res.status(statusCode).json({ success: false, message });
        }
        // If called without error (middleware chaining), do nothing —
        // the controller itself will call res.json()
    };

    try {
        await controller(req, res, next);
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err?.message || "Internal Server Error",
        });
    }

    return promise;
}
