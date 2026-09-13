import crypto from "crypto";

const PIN_LENGTH = 6;
const SESSION_DURATION_SECONDS = 60 * 60; // 1 hour

function getSecret() {
  const secret = process.env.PIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("PIN_SESSION_SECRET is not configured");
  }

  return secret;
}

export function validatePinFormat(pin: string) {
  return /^\d{6}$/.test(pin);
}

export function hashPin(pin: string) {
  if (!validatePinFormat(pin)) {
    throw new Error("PIN must contain exactly 6 digits");
  }

  const salt = crypto.randomBytes(16).toString("hex");

  const derivedKey = crypto.scryptSync(pin, salt, 64);

  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPin(pin: string, storedHash: string) {
  if (!validatePinFormat(pin)) {
    return false;
  }

  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  try {
    const derivedKey = crypto.scryptSync(pin, salt, 64);

    const storedKey = Buffer.from(hash, "hex");

    if (storedKey.length !== derivedKey.length) {
      return false;
    }

    return crypto.timingSafeEqual(derivedKey, storedKey);
  } catch {
    return false;
  }
}

export function createPinSessionToken(userId: string) {
  const expiresAt =
    Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;

  const payload = `${userId}.${expiresAt}`;

  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export function verifyPinSessionToken(
  token: string | undefined,
  userId: string
) {
  if (!token) {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [tokenUserId, expiresAtString, signature] = parts;

  if (tokenUserId !== userId) {
    return false;
  }

  const expiresAt = Number(expiresAtString);

  if (!Number.isFinite(expiresAt)) {
    return false;
  }

  if (Math.floor(Date.now() / 1000) >= expiresAt) {
    return false;
  }

  const payload = `${tokenUserId}.${expiresAt}`;

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  const actual = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (actual.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(actual, expected);
}
export function createPinAttemptToken(
  userId: string,
  attempts: number,
  lockedUntil: number
) {
  const payload = `${userId}.${attempts}.${lockedUntil}`;

  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

export function verifyPinAttemptToken(
  token: string | undefined,
  userId: string
) {
  if (!token) return null;

  const parts = token.split(".");

  if (parts.length !== 4) return null;

  const [
    tokenUserId,
    attemptsString,
    lockedUntilString,
    signature,
  ] = parts;

  if (tokenUserId !== userId) return null;

  const attempts = Number(attemptsString);
  const lockedUntil = Number(lockedUntilString);

  if (
    !Number.isInteger(attempts) ||
    attempts < 0
  ) {
    return null;
  }

  if (!Number.isInteger(lockedUntil)) {
    return null;
  }

  const payload = `${tokenUserId}.${attempts}.${lockedUntil}`;

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  const actual = Buffer.from(signature, "hex");
  const expected = Buffer.from(
    expectedSignature,
    "hex"
  );

  if (actual.length !== expected.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(actual, expected)) {
    return null;
  }

  return {
    attempts,
    lockedUntil:
      lockedUntil > Math.floor(Date.now() / 1000)
        ? lockedUntil
        : 0,
  };
}

export { PIN_LENGTH, SESSION_DURATION_SECONDS };