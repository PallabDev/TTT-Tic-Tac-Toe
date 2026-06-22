import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/errors";

export async function POST() {
  try {
    const { getAuthUser } = await import("@/lib/session");
    const user = await getAuthUser();

    await prisma.user.update({
      where: { id: user?.userId || "" },
      data: { hashedRefreshToken: null },
    }).catch(() => {});

    const response = successResponse(null, "Logged out");
    response.cookies.delete("refreshToken");
    return response;
  } catch {
    const response = successResponse(null, "Logged out");
    response.cookies.delete("refreshToken");
    return response;
  }
}
