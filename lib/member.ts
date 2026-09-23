import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function currentRegisteredMember() {
  const user = await getChatGPTUser();
  if (!user || !env.DB) return null;
  const profile = await env.DB.prepare(
    "SELECT user_id, display_name FROM profiles WHERE user_id = ?1",
  ).bind(user.userId).first<{ user_id: string; display_name: string }>();
  return profile ? { userId: user.userId, displayName: profile.display_name } : null;
}

export function json(data: unknown, status = 200, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return Response.json(data, { status, headers });
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}

export function cleanText(value: unknown, max = 100) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function safeNumber(value: unknown, max: number) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= max
    ? String(Math.round(number * 10) / 10)
    : null;
}
