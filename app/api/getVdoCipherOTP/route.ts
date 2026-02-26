import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
const { generateVideoUrl } = require("@/api/controllers/courseController");

export async function POST(request: NextRequest) {
    return runController(request, generateVideoUrl);
}
