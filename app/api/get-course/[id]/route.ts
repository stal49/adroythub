import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
const { getSingleCourse } = require("@/api/controllers/courseController");

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return runController(request, getSingleCourse, { params });
}
