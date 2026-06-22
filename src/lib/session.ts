import { cookies, headers } from "next/headers";
import { verifyAccessToken, type TokenPayload } from "./auth";

export async function getAuthUser(): Promise<TokenPayload | null> {
  // 1. Try Authorization header
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = await verifyAccessToken(token);
      if (payload) return payload;
    }
  } catch (err) {
    console.error("Error reading authorization header:", err);
  }

  // 2. Fallback to cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (token) {
      return verifyAccessToken(token);
    }
  } catch (err) {
    console.error("Error reading cookies:", err);
  }

  return null;
}
