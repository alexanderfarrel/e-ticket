import jwt from "jsonwebtoken";

export default async function verifyToken(token: string, admin: boolean) {
  const decode: { role: string } = jwt.verify(
    token,
    process.env.NEXTAUTH_SECRET!
  ) as { role: string };

  if (!decode) {
    throw new Error("Invalid token");
  }
  if (admin && decode.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return {
    valid: true,
  };
}
