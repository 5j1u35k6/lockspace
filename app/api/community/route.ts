import { env } from "cloudflare:workers";
import { currentRegisteredMember, json } from "@/lib/member";

export const dynamic = "force-dynamic";

function todayInTaipei() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function newTaskCode() {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(100000 + (bytes[0] % 900000));
}

export async function GET() {
  const member = await currentRegisteredMember();
  if (!member) return json({ error: "請先註冊或登入。" }, 401);
  if (!env.DB) return json({ error: "資料服務暫時無法使用。" }, 503);

  const date = todayInTaipei();
  try {
    let task = await env.DB.prepare(
      "SELECT task_date, code FROM daily_tasks WHERE task_date = ?1",
    ).bind(date).first<{ task_date: string; code: string }>();

    if (!task) {
      await env.DB.prepare(
        "INSERT OR IGNORE INTO daily_tasks (task_date, code, created_at) VALUES (?1, ?2, ?3)",
      ).bind(date, newTaskCode(), Date.now()).run();
      task = await env.DB.prepare(
        "SELECT task_date, code FROM daily_tasks WHERE task_date = ?1",
      ).bind(date).first<{ task_date: string; code: string }>();
    }

    const result = await env.DB.prepare(`
      SELECT s.id, s.user_id, s.created_at, p.display_name, p.pronouns,
        p.lock_brand, p.lock_color, p.cage_length_cm, p.cage_width_cm,
        p.body_length_cm, p.body_girth_cm, p.height_cm, p.weight_kg,
        p.skin_tone, p.body_type,
        SUM(CASE WHEN v.result = 'pass' THEN 1 ELSE 0 END) AS pass_count,
        SUM(CASE WHEN v.result = 'retry' THEN 1 ELSE 0 END) AS retry_count,
        MAX(CASE WHEN v.user_id = ?1 THEN v.result ELSE NULL END) AS my_vote
      FROM submissions s
      JOIN profiles p ON p.user_id = s.user_id
      LEFT JOIN votes v ON v.submission_id = s.id
      WHERE s.task_date = ?2
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 50
    `).bind(member.userId, date).all<{
      id: string; user_id: string; created_at: number; display_name: string; pronouns: string | null;
      lock_brand: string | null; lock_color: string | null; cage_length_cm: string | null; cage_width_cm: string | null;
      body_length_cm: string | null; body_girth_cm: string | null; height_cm: string | null; weight_kg: string | null;
      skin_tone: string | null; body_type: string | null; pass_count: number; retry_count: number; my_vote: "pass" | "retry" | null;
    }>();

    const posts = (result.results ?? []).map((row) => ({
      id: row.id,
      imageUrl: `/api/proofs/${encodeURIComponent(row.id)}`,
      createdAt: row.created_at,
      isMine: row.user_id === member.userId,
      profile: {
        displayName: row.display_name,
        pronouns: row.pronouns,
        lockBrand: row.lock_brand,
        lockColor: row.lock_color,
        cageLengthCm: row.cage_length_cm,
        cageWidthCm: row.cage_width_cm,
        bodyLengthCm: row.body_length_cm,
        bodyGirthCm: row.body_girth_cm,
        heightCm: row.height_cm,
        weightKg: row.weight_kg,
        skinTone: row.skin_tone,
        bodyType: row.body_type,
      },
      passCount: row.pass_count ?? 0,
      retryCount: row.retry_count ?? 0,
      myVote: row.my_vote,
    }));

    return json({
      task: task ? { date: task.task_date, code: task.code, instruction: "將今日隨機數字寫在紙條上，與鎖具外觀同框拍照。" } : null,
      posts,
      member: { userId: member.userId, displayName: member.displayName },
    });
  } catch (error) {
    console.error("community_load_failed", error);
    return json({ error: "目前無法載入任務，請稍後重試。" }, 503);
  }
}
