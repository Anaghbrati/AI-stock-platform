
import {
  createPinAttemptToken,
  verifyPin,
  verifyPinAttemptToken,
} from "./pin";

export const PIN_ATTEMPT_COOKIE_NAME = "pin_attempts";

export const MAX_PIN_ATTEMPTS = 5;

export const PIN_LOCKOUT_SECONDS = 10 * 60;

export type PinVerificationResult =
  | {
      success: true;
      clearAttempts: boolean;
    }
  | {
      success: false;
      reason: "locked" | "invalid";
      attempts: number;
      lockedUntil: number;
      attemptToken: string;
    };

export function verifyPinWithRateLimit(
  pin: string,
  storedHash: string,
  userId: string,
  attemptCookieValue?: string
): PinVerificationResult {
  const now = Math.floor(Date.now() / 1000);

  const attemptState = verifyPinAttemptToken(
    attemptCookieValue,
    userId
  );

  /*
   * --------------------------------------------------
   * CHECK EXISTING LOCKOUT
   * --------------------------------------------------
   */

  if (attemptState && attemptState.lockedUntil > now) {
    return {
      success: false,
      reason: "locked",
      attempts: attemptState.attempts,
      lockedUntil: attemptState.lockedUntil,
      attemptToken: createPinAttemptToken(
        userId,
        attemptState.attempts,
        attemptState.lockedUntil
      ),
    };
  }

  /*
   * --------------------------------------------------
   * VERIFY PIN
   * --------------------------------------------------
   */

  const validPin = verifyPin(pin, storedHash);

  if (validPin) {
    return {
      success: true,

      /*
       * The caller should remove the attempt cookie
       * after successful verification.
       */
      clearAttempts: true,
    };
  }

  /*
   * --------------------------------------------------
   * WRONG PIN
   * --------------------------------------------------
   */

  const previousAttempts =
    attemptState?.attempts ?? 0;

  const attempts = previousAttempts + 1;

  /*
   * Lock the account after the fifth incorrect attempt.
   */

  if (attempts >= MAX_PIN_ATTEMPTS) {
    const lockedUntil =
      now + PIN_LOCKOUT_SECONDS;

    return {
      success: false,
      reason: "locked",
      attempts,
      lockedUntil,
      attemptToken: createPinAttemptToken(
        userId,
        attempts,
        lockedUntil
      ),
    };
  }

  /*
   * Still below the maximum number of attempts.
   */

  return {
    success: false,
    reason: "invalid",
    attempts,
    lockedUntil: 0,
    attemptToken: createPinAttemptToken(
      userId,
      attempts,
      0
    ),
  };
}
