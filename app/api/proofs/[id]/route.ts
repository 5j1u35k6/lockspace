import { env } from "cloudflare:workers";
import { currentRegisteredMember, json } from "@/lib/member";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const member = await currentRegisteredMember();
  if (!member) return json({ error: "請先註冊或登入。" }, 401);
  if (!env.DB || !env.BUCKET) return json({ error: "圖片服務暫時無法使用。" }, 503);

  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "找不到這張任務照片。" }, 404);
  try {
    const record = await env.DB.prepare(
      "SELECT object_key FROM submissions WHERE id = ?1",
    ).bind(id).first<{ object_key: string }>();
    if (!record) return json({ error: "找不到這張任務照片。" }, 404);
    const object = await env.BUCKET.get(record.object_key);
    if (!object) return json({ error: "照片已刪除。" }, 404);

    return new Response(object.body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": "inline; filename=lockspace-proof.jpg",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Cross-Origin-Resource-Policy": "same-origin",
      },
    });
  } catch (error) {
    console.error("proof_read_failed", error);
    return json({ error: "目前無法讀取照片。" }, 503);
  }
}
