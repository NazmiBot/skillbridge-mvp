/**
 * 🛡️ Input validation for job titles and career fields
 *
 * Blocks profanity, keyboard smashes, and garbage before it hits
 * the Anthropic API (saves tokens + keeps /explore clean).
 * Zero external dependencies.
 */

const PROFANITY = new Set([
  "fuck", "fucking", "fucked", "shit", "shitty", "ass", "asshole",
  "bitch", "dick", "cock", "pussy", "cunt", "nigger", "nigga",
  "fag", "faggot", "whore", "slut", "retard", "retarded", "bastard",
  "penis", "vagina", "anus", "titties", "tits", "bollocks", "wanker",
  "twat", "piss", "damn", "damnit",
]);

const MIN_LENGTH = 4;
const MAX_LENGTH = 80;

/** Only allow letters, spaces, hyphens, slashes, ampersands, periods, commas, parens, numbers */
const VALID_TITLE_RE = /^[a-zA-Z0-9\s\-/&.,()'+]+$/;

/** Check if any word in the text is profane */
function containsProfanity(text: string): boolean {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/);
  return words.some((w) => PROFANITY.has(w));
}

/** Detect keyboard smashes: repeating patterns, no vowels, etc. */
function isKeyboardSmash(text: string): boolean {
  const clean = text.toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length < 3) return true;
  // No vowels
  if (!/[aeiou]/.test(clean)) return true;
  // Repeated char runs (aaaa)
  if (/(.)\1{3,}/.test(clean)) return true;
  // Repeating 2-3 char pattern (asdasd, ababab)
  if (/^(.{2,3})\1{1,}$/.test(clean)) return true;
  // Too few unique chars relative to length
  const unique = new Set(clean.split("")).size;
  if (unique <= 2 && clean.length > 3) return true;
  return false;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a job title input (currentRole or targetRole).
 * Returns { valid: true } or { valid: false, error: "..." }
 */
export function validateJobTitle(
  title: string | undefined | null,
  fieldName: string = "Job title"
): ValidationResult {
  if (!title || typeof title !== "string") {
    return { valid: false, error: `${fieldName} is required.` };
  }

  const trimmed = title.trim();

  if (trimmed.length < MIN_LENGTH) {
    return {
      valid: false,
      error: `Please enter a valid ${fieldName.toLowerCase()} (at least ${MIN_LENGTH} characters).`,
    };
  }

  if (trimmed.length > MAX_LENGTH) {
    return {
      valid: false,
      error: `${fieldName} is too long (max ${MAX_LENGTH} characters).`,
    };
  }

  if (!VALID_TITLE_RE.test(trimmed)) {
    return {
      valid: false,
      error: `Please enter a valid ${fieldName.toLowerCase()}.`,
    };
  }

  if (isKeyboardSmash(trimmed)) {
    return {
      valid: false,
      error: `Please enter a valid ${fieldName.toLowerCase()}.`,
    };
  }

  if (containsProfanity(trimmed)) {
    return {
      valid: false,
      error: `Please enter a valid ${fieldName.toLowerCase()}.`,
    };
  }

  return { valid: true };
}
