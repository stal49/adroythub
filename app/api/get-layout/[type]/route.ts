import { NextRequest } from "next/server";
import { runController } from "@/lib/expressAdapter";
const { getLayoutByType } = require("@/api/controllers/layoutController");

export async function GET(
    request: NextRequest,
    { params }: { params: { type: string } }
) {
    return runController(request, getLayoutByType, { params });
}
