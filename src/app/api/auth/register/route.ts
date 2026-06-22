import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return errorResponse("Email is already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), password: hashedPassword },
    });

    const payload = { userId: user.id, email: user.email };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken: await bcrypt.hash(refreshToken, 10) },
    });

    const response = successResponse(
      { accessToken, user: { id: user.id, email: user.email } },
      "Registered successfully",
      201
    );

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return errorResponse("Internal server error", 500);
  }
}
