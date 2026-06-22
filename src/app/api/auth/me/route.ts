import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/session";
import { successResponse, errorResponse } from "@/lib/errors";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return errorResponse("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse({ user });
  } catch (error) {
    console.error("Get me error:", error);
    return errorResponse("Internal server error", 500);
  }
}
