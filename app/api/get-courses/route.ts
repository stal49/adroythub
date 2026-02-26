import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
const { getAllCourses } = require("@/api/controllers/courseController");

export async function GET(request: NextRequest) {
    return runController(request, getAllCourses);
}
