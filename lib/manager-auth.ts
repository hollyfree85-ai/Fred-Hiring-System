import { env } from "cloudflare:workers";

export const MANAGER_COOKIE = "juicy_manager_session";
const SESSION_SECONDS = 8 * 60 * 60;

const encoder = new TextEncoder();

function runtimeValue(key: "MANAGER_USERNAME" | "MANAGER_PASSCODE" | "SESSION_SECRET") {
  const value = env[key];
  if (!value) throw new Error(`Required runtime setting ${key} is unavailable.`);
  return value;
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(runtimeValue("SESSION_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

function sameText(a: string, b: string) {
  const maxLength = Math.max(a.length, b.length);
  let difference = a.length ^ b.length;
  for (let index = 0; index < maxLength; index += 1) {
    difference |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }
  return difference === 0;
}

export function validManagerCredentials(username: string, passcode: string) {
  return (
    sameText(username.trim().toLocaleLowerCase(), runtimeValue("MANAGER_USERNAME").toLocaleLowerCase()) &&
    sameText(passcode, runtimeValue("MANAGER_PASSCODE"))
  );
}

export async function createManagerCookie(username: string) {
  const payload = base64Url(
    encoder.encode(
      JSON.stringify({
        username,
        expiresAt: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
        nonce: crypto.randomUUID(),
      }),
    ),
  );
  const signature = await hmac(payload);
  return `${MANAGER_COOKIE}=${payload}.${signature}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearManagerCookie() {
  return `${MANAGER_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

function cookieValue(request: Request, name: string) {
  const cookies = request.headers.get("cookie") ?? "";
  for (const item of cookies.split(";")) {
    const [key, ...rest] = item.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

export async function isManagerRequest(request: Request) {
  const token = cookieValue(request, MANAGER_COOKIE);
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator < 1) return false;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = await hmac(payload);
  if (!sameText(signature, expected)) return false;
  try {
    const base = payload.replaceAll("-", "+").replaceAll("_", "/");
    const normalized = base.padEnd(base.length + ((4 - (base.length % 4)) % 4), "=");
    const decoded = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0)),
      ),
    ) as { username?: string; expiresAt?: number };
    return (
      decoded.username?.toLocaleLowerCase() ===
        runtimeValue("MANAGER_USERNAME").toLocaleLowerCase() &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export async function requestFingerprint(request: Request) {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  return hmac(`manager-login:${ip}`);
}
