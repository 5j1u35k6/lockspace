import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { currentRegisteredMember, json, sameOrigin } from "@/lib/member";

export const dynamic = "force-dynamic";
const MAX_BYTES = 12 * 1024 * 1024;

function stripJpegMetadata(bytes: Uint8Array) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return null;
  const pieces: Uint8Array[] = [bytes.slice(0, 2)];
  let offset = 2;
  let sawImageData = false;
  while (offset + 1 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const markerStart = offset;
    while (bytes[offset] === 0xff) offset++;
    if (offset >= bytes.length) return null;
    const marker = bytes[offset++];
    if (marker === 0xda) {
      pieces.push(bytes.slice(markerStart));
      sawImageData = true;
      break;
    }
    if (marker === 0xd9) {
      pieces.push(bytes.slice(markerStart, offset));
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      pieces.push(bytes.slice(markerStart, offset));
      continue;
    }
    if (offset + 1 >= bytes.length) return null;
    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    const end = offset + segmentLength;
    if (segmentLength < 2 || end > bytes.length) return null;
    if (marker !== 0xe1 && marker !== 0xed && marker !== 0xfe) {
      pieces.push(bytes.slice(markerStart, end));
    }
    offset = end;
  }
  const size = pieces.reduce((sum, part) => sum + part.length, 0);
  if (!sawImageData || size < 8 || pieces.length < 2 || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9) return null;
  const clean = new Uint8Array(size);
  let cursor = 0;
  for (const part of pieces) {
    clean.set(part, cursor);
    cursor += part.length;
  }
  return clean;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "請從本站送出照片。" }, 403);
  const identity = await getChatGPTUser();
  if (!identity) return json({ error: "請先登入並完成註冊。" }, 401);
  const member = await currentRegisteredMember();
  if (!member) return json({ error: "請先完成註冊。" }, 403);
  if (!env.DB || !env.BUCKET) return json({ error: "圖片服務暫時無法使用。" }, 503);
  const contentLength = Number(request.headers.get("content-length"));
  if (!Number.isFinite(contentLength) || contentLength <= 0 || contentLength > MAX_BYTES + 128 * 1024) {
    return json({ error: "請選擇 12 MB 以內的照片。" }, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "上傳資料格式不正確。" }, 400);
  }
  if (form.get("adultConsent") !== "yes" || form.get("ownershipConsent") !== "yes") {
    return json({ error: "請確認成年、影像所有權及提交同意。" }, 400);
  }
  const file = form.get("photo");
  if (!(file instanceof File)) return json({ error: "請選擇一張照片。" }, 400);
  if (file.size > MAX_BYTES) return json({ error: "照片上限為 12 MB。" }, 413);
  if (file.type !== "image/jpeg") return json({ error: "請上傳加有浮水印的 JPEG 照片。" }, 415);

  const now = Date.now();
  const dayStart = now - 24 * 60 * 60 * 1000;
  try {
    const count = await env.DB.prepare(
      "SELECT COUNT(*) AS total FROM submissions WHERE user_id = ?1 AND created_at >= ?2",
    ).bind(member.userId, dayStart).first<{ total: number }>();
    if ((count?.total ?? 0) >= 5) return json({ error: "每 24 小時最多提交 5 張照片。" }, 429);

    const cleaned = stripJpegMetadata(new Uint8Array(await file.arrayBuffer()));
    if (!cleaned) return json({ error: "照片檔案無法驗證，請重新選擇 JPEG 圖片。" }, 400);

    const task = await env.DB.prepare(
      "SELECT task_date FROM daily_tasks ORDER BY task_date DESC LIMIT 1",
    ).first<{ task_date: string }>();
    if (!task) return json({ error: "今日任務尚未建立，請重新載入頁面。" }, 409);

    const submissionId = crypto.randomUUID();
    const objectKey = `proofs/${crypto.randomUUID()}.jpg`;
    await env.BUCKET.put(objectKey, cleaned, {
      httpMetadata: { contentType: "image/jpeg", cacheControl: "private, no-store" },
      customMetadata: { owner: member.userId, watermark: "lockspace" },
    });
    try {
      await env.DB.prepare(
        "INSERT INTO submissions (id, user_id, task_date, object_key, created_at) VALUES (?1, ?2, ?3, ?4, ?5)",
      ).bind(submissionId, member.userId, task.task_date, objectKey, now).run();
    } catch (error) {
      await env.BUCKET.delete(objectKey);
      throw error;
    }
    return json({ ok: true, id: submissionId }, 201);
  } catch (error) {
    console.error("submission_upload_failed", error);
    return json({ error: "照片未能安全儲存，請稍後重試。" }, 503);
  }
}
