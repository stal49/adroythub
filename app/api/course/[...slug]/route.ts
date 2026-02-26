/**
 * app/api/course/[...slug]/route.ts
 *
 * Handles all course routes:
 *   GET    /api/course/list             → get all courses (public)
 *   GET    /api/course/admin            → get all courses (admin)
 *   GET    /api/course/:id              → get single course (public)
 *   GET    /api/course/content/:id      → get course content (authenticated)
 *   POST   /api/course/create           → create course (admin)
 *   POST   /api/course/vdo-otp          → get VdoCipher OTP
 *   POST   /api/course/register-institute → register institute (admin)
 *   PUT    /api/course/edit/:id         → edit course (admin)
 *   PUT    /api/course/question         → add question
 *   PUT    /api/course/answer           → add answer
 *   PUT    /api/course/reply            → add reply to review
 *   PUT    /api/course/review/:id       → add review
 *   DELETE /api/course/delete/:id       → delete course (admin)
 */
import { NextRequest, NextResponse } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate, checkRole } from "@/lib/auth";

const {
    uploadCourse,
    editCourse,
    getSingleCourse,
    getAllCourses,
    getCourseByUser,
    addQuestion,
    addAnswer,
    addReplyToReview,
    addReview,
    getAdminAllCourses,
    deleteCourse,
    generateVideoUrl,
    registerInstitute,
} = require("@/api/controllers/courseController");

type Context = { params: Promise<{ slug: string[] }> };

async function requireAuth(request: NextRequest) {
    return authenticate(request);
}

export async function GET(request: NextRequest, { params }: Context) {
    const { slug } = await params;

    // GET /api/course/list
    if (slug[0] === "list") {
        return runController(request, getAllCourses);
    }

    // GET /api/course/admin
    if (slug[0] === "admin") {
        const { user, error } = await requireAuth(request);
        if (error) return error;
        const roleError = checkRole(user, "admin");
        if (roleError) return roleError;
        return runController(request, getAdminAllCourses, { user });
    }

    // GET /api/course/content/:id
    if (slug[0] === "content" && slug[1]) {
        const { user, error } = await requireAuth(request);
        if (error) return error;
        return runController(request, getCourseByUser, { user, params: { id: slug[1] } });
    }

    // GET /api/course/:id  (must be last — any single segment = course id)
    if (slug.length === 1) {
        return runController(request, getSingleCourse, { params: { id: slug[0] } });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function POST(request: NextRequest, { params }: Context) {
    const { slug } = await params;

    if (slug[0] === "create") {
        const { user, error } = await requireAuth(request);
        if (error) return error;
        const roleError = checkRole(user, "admin");
        if (roleError) return roleError;
        return runController(request, uploadCourse, { user });
    }

    if (slug[0] === "vdo-otp") {
        const { user, error } = await requireAuth(request);
        if (error) return error;
        return runController(request, generateVideoUrl, { user });
    }

    if (slug[0] === "register-institute") {
        const { user, error } = await requireAuth(request);
        if (error) return error;
        const roleError = checkRole(user, "admin");
        if (roleError) return roleError;
        return runController(request, registerInstitute, { user });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: Context) {
    const { slug } = await params;

    const { user, error } = await requireAuth(request);
    if (error) return error;

    // PUT /api/course/edit/:id
    if (slug[0] === "edit" && slug[1]) {
        const roleError = checkRole(user, "admin");
        if (roleError) return roleError;
        return runController(request, editCourse, { user, params: { id: slug[1] } });
    }

    // PUT /api/course/review/:id
    if (slug[0] === "review" && slug[1]) {
        return runController(request, addReview, { user, params: { id: slug[1] } });
    }

    if (slug[0] === "question") return runController(request, addQuestion, { user });
    if (slug[0] === "answer") return runController(request, addAnswer, { user });
    if (slug[0] === "reply") return runController(request, addReplyToReview, { user });

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}

export async function DELETE(request: NextRequest, { params }: Context) {
    const { slug } = await params;

    // DELETE /api/course/delete/:id
    if (slug[0] === "delete" && slug[1]) {
        const { user, error } = await requireAuth(request);
        if (error) return error;
        const roleError = checkRole(user, "admin");
        if (roleError) return roleError;
        return runController(request, deleteCourse, { user, params: { id: slug[1] } });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
}
