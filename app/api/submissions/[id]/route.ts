import { env } from "cloudflare:workers";
import { currentRegisteredMember, json, sameOrigin } from "@/lib/member";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return json({ error: "請從本站送出刪除要求。" }, 403);
  const member = await currentRegisteredMember();
  if (!member) return json({ error: "請先註冊或登入。" }, 401);
  if (!env.DB || !env.BUCKET) return json({ error: "圖片服務暫時無法使用。" }, 503);
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "找不到這項提交。" }, 404);
  try {
    const post = await env.DB.prepare(
      "SELECT object_key FROM submissions WHERE id = ?1 AND user_id = ?2",
    ).bind(id, member.userId).first<{ object_key: string }>();
    if (!post) return json({ error: "只能刪除自己的提交。" }, 404);
    await env.DB.prepare("DELETE FROM submissions WHERE id = ?1 AND user_id = ?2")
      .bind(id, member.userId).run();
    await env.BUCKET.delete(post.object_key);
    return json({ ok: true });
  } catch (error) {
    console.error("submission_delete_failed", error);
    return json({ error: "目前無法刪除照片，請稍後重試。" }, 503);
  }
}
