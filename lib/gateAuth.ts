export function validateGateSecret(secret: string | null) {
  const envSecret = process.env.GATE_SECRET;
  
  if (!envSecret) {
    console.error("GATE_SECRET is not set in environment variables");
    return false;
  }

  return secret === envSecret;
}
