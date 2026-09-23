import { env } from "cloudflare:workers";
import { currentRegisteredMember, json, sameOrigin } from "@/lib/member";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return json({ error: "請從本站送出刪除要求。" }, 403);
  const member = await currentRegisteredMember();
  if (!member) return json({ error: "帳戶不存在或尚未註冊。" }, 404);
  if (!env.DB || !env.BUCKET) return json({ error: "帳戶服務暫時無法使用。" }, 503);
  try {
    const result = await env.DB.prepare(
      "SELECT object_key FROM submissions WHERE user_id = ?1",
    ).bind(member.userId).all<{ object_key: string }>();
    for (const row of result.results ?? []) await env.BUCKET.delete(row.object_key);
    await env.DB.prepare("DELETE FROM profiles WHERE user_id = ?1").bind(member.userId).run();
    return json({ ok: true });
  } catch (error) {
    console.error("account_delete_failed", error);
    return json({ error: "無法完成刪除，請稍後重試。" }, 503);
  }
}
