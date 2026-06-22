import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return errorResponse("Refresh token missing", 401);
    }

    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return errorResponse("Invalid refresh token", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.hashedRefreshToken) {
      return errorResponse("Invalid refresh token", 401);
    }

    const isTokenValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isTokenValid) {
      return errorResponse("Refresh token has expired", 401);
    }

    const { signAccessToken, signRefreshToken } = await import("@/lib/auth");
    const newPayload = { userId: user.id, email: user.email };
    const newAccessToken = await signAccessToken(newPayload);
    const newRefreshToken = await signRefreshToken(newPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken: await bcrypt.hash(newRefreshToken, 10) },
    });

    const response = successResponse({ accessToken: newAccessToken }, "Token refreshed");

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return errorResponse("Internal server error", 500);
  }
}
