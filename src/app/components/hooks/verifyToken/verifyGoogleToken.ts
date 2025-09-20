export async function verifyGoogleToken(token: string) {
  const res = await fetch(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`
  );

  if (!res.ok) {
    throw new Error("Access Denied");
  }
  return { valid: true };
}
