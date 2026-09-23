import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { cleanText, json, safeNumber, sameOrigin } from "@/lib/member";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "請從本站送出資料。" }, 403);
  const user = await getChatGPTUser();
  if (!user) return json({ error: "請先登入，再完成註冊。" }, 401);
  if (!env.DB) return json({ error: "資料服務暫時無法使用。" }, 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "資料格式不正確。" }, 400);
  }
  if (body.adultConfirmed !== true || body.publicDataConsent !== true) {
    return json({ error: "請先確認成年並同意個人檔案資料公開。" }, 400);
  }

  const displayName = cleanText(body.displayName, 32);
  if (!displayName) return json({ error: "請填寫顯示名稱。" }, 400);

  const now = Date.now();
  const values = [
    displayName,
    cleanText(body.pronouns, 32) || null,
    cleanText(body.bio, 240) || null,
    cleanText(body.lockBrand, 64) || null,
    cleanText(body.lockColor, 32) || null,
    safeNumber(body.cageLengthCm, 80),
    safeNumber(body.cageWidthCm, 80),
    safeNumber(body.bodyLengthCm, 80),
    safeNumber(body.bodyGirthCm, 80),
    safeNumber(body.heightCm, 260),
    safeNumber(body.weightKg, 400),
    cleanText(body.skinTone, 40) || null,
    cleanText(body.bodyType, 60) || null,
  ];

  try {
    await env.DB.prepare(`
      INSERT INTO profiles (
        user_id, display_name, pronouns, bio, lock_brand, lock_color,
        cage_length_cm, cage_width_cm, body_length_cm, body_girth_cm,
        height_cm, weight_kg, skin_tone, body_type,
        adult_attested_at, public_profile_consent_at, created_at, updated_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?17)
      ON CONFLICT(user_id) DO UPDATE SET
        display_name=excluded.display_name, pronouns=excluded.pronouns, bio=excluded.bio,
        lock_brand=excluded.lock_brand, lock_color=excluded.lock_color,
        cage_length_cm=excluded.cage_length_cm, cage_width_cm=excluded.cage_width_cm,
        body_length_cm=excluded.body_length_cm, body_girth_cm=excluded.body_girth_cm,
        height_cm=excluded.height_cm, weight_kg=excluded.weight_kg,
        skin_tone=excluded.skin_tone, body_type=excluded.body_type,
        adult_attested_at=excluded.adult_attested_at,
        public_profile_consent_at=excluded.public_profile_consent_at,
        updated_at=excluded.updated_at
    `).bind(user.userId, ...values, now, now, now).run();
    return json({ ok: true });
  } catch (error) {
    console.error("profile_save_failed", error);
    return json({ error: "無法儲存檔案，請稍後再試。" }, 503);
  }
}
