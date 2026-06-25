export async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    // No key configured. Allow in local dev for convenience, but fail CLOSED in
    // production — a missing key in prod is a misconfiguration, not a bypass.
    if (process.env.NODE_ENV === "production") {
      console.error("TURNSTILE_SECRET_KEY missing in production — rejecting submission.");
      return false;
    }
    return true;
  }

  if (!token) return false;

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
      }
    );
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    // Network/verification error → fail closed rather than letting traffic through.
    console.error("Turnstile verification request failed:", err);
    return false;
  }
}
