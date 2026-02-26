import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
import { authenticate } from "@/lib/auth";
const { addQuestion } = require("@/api/controllers/courseController");

export async function PUT(request: NextRequest) {
    const { user, error } = await authenticate(request);
    if (error) return error;
    return runController(request, addQuestion, { user });
}
