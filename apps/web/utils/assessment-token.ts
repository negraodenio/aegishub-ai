import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.SUPABASE_JWT_SECRET || "fallback-secret-for-dev-only-32-chars-min"
);

export async function generateAssessmentToken(employeeId: string, tenantId: string) {
  return await new SignJWT({ employeeId, tenantId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyAssessmentToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      success: true,
      employeeId: payload.employeeId as string,
      tenantId: payload.tenantId as string,
    };
  } catch (err) {
    console.error("[JWT_VERIFY_ERROR]", err);
    return { success: false };
  }
}
