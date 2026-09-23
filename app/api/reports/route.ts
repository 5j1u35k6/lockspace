import { env } from "cloudflare:workers";
import { currentRegisteredMember, json, sameOrigin } from "@/lib/member";

export const dynamic = "force-dynamic";
const REASONS = new Set(["nonconsensual", "underage", "impersonation", "harassment", "other"]);

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "請從本站送出檢舉。" }, 403);
  const member = await currentRegisteredMember();
  if (!member) return json({ error: "請先註冊或登入。" }, 401);
  if (!env.DB) return json({ error: "資料服務暫時無法使用。" }, 503);
  let body: { submissionId?: unknown; reason?: unknown };
  try { body = await request.json(); } catch { return json({ error: "資料格式不正確。" }, 400); }
  const submissionId = typeof body.submissionId === "string" ? body.submissionId : "";
  const reason = typeof body.reason === "string" ? body.reason : "";
  if (!/^[0-9a-f-]{36}$/i.test(submissionId) || !REASONS.has(reason)) {
    return json({ error: "請選擇有效的檢舉原因。" }, 400);
  }
  try {
    const exists = await env.DB.prepare("SELECT id FROM submissions WHERE id = ?1")
      .bind(submissionId).first<{ id: string }>();
    if (!exists) return json({ error: "找不到這項提交。" }, 404);
    const result = await env.DB.prepare(
      "INSERT OR IGNORE INTO reports (id, submission_id, reporter_user_id, reason, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
    ).bind(crypto.randomUUID(), submissionId, member.userId, reason, Date.now()).run();
    if ((result.meta.changes ?? 0) === 0) return json({ error: "你已檢舉這項提交。" }, 409);
    return json({ ok: true }, 201);
  } catch (error) {
    console.error("report_create_failed", error);
    return json({ error: "目前無法送出檢舉。" }, 503);
  }
}
