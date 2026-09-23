import { env } from "cloudflare:workers";
import { currentRegisteredMember, json, sameOrigin } from "@/lib/member";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "請從本站送出驗證結果。" }, 403);
  const member = await currentRegisteredMember();
  if (!member) return json({ error: "請先註冊或登入。" }, 401);
  if (!env.DB) return json({ error: "資料服務暫時無法使用。" }, 503);

  let body: { submissionId?: unknown; result?: unknown };
  try { body = await request.json(); } catch { return json({ error: "資料格式不正確。" }, 400); }
  const submissionId = typeof body.submissionId === "string" ? body.submissionId : "";
  const result = body.result === "pass" || body.result === "retry" ? body.result : null;
  if (!/^[0-9a-f-]{36}$/i.test(submissionId) || !result) return json({ error: "驗證資料不正確。" }, 400);

  try {
    const post = await env.DB.prepare("SELECT user_id FROM submissions WHERE id = ?1")
      .bind(submissionId).first<{ user_id: string }>();
    if (!post) return json({ error: "找不到這項提交。" }, 404);
    if (post.user_id === member.userId) return json({ error: "不能驗證自己的提交。" }, 403);
    const saved = await env.DB.prepare(
      "INSERT OR IGNORE INTO votes (id, submission_id, user_id, result, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
    ).bind(crypto.randomUUID(), submissionId, member.userId, result, Date.now()).run();
    if ((saved.meta.changes ?? 0) === 0) return json({ error: "你已驗證過這項提交。" }, 409);
    return json({ ok: true });
  } catch (error) {
    console.error("vote_save_failed", error);
    return json({ error: "無法儲存驗證結果。" }, 503);
  }
}
