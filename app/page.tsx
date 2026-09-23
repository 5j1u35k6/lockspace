import { env } from "cloudflare:workers";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { RegistrationForm, type ProfileData } from "@/app/member-app";
import { MemberDashboard } from "@/app/member-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  if (!user) return <SignIn />;
  if (!env.DB) return <ServiceError />;

  let profile: ProfileData | null;
  try {
    profile = await env.DB.prepare(`
      SELECT display_name AS displayName, pronouns, bio, lock_brand AS lockBrand,
        lock_color AS lockColor, cage_length_cm AS cageLengthCm,
        cage_width_cm AS cageWidthCm, body_length_cm AS bodyLengthCm,
        body_girth_cm AS bodyGirthCm, height_cm AS heightCm, weight_kg AS weightKg,
        skin_tone AS skinTone, body_type AS bodyType
      FROM profiles WHERE user_id = ?1
    `).bind(user.userId).first<ProfileData>();
  } catch (error) {
    console.error("profile_lookup_failed", error);
    return <ServiceError />;
  }

  if (!profile) {
    return <RegistrationForm initialName={user.displayName} />;
  }

  return <MemberDashboard profile={profile} />;
}

function SignIn() {
  const path = chatGPTSignInPath("/");
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand"><span className="brand-mark">⌑</span>lockspace<span className="brand-dot">.</span></div>
        <p className="eyebrow">MEMBER COMMUNITY</p>
        <h1>先登入，再建立會員檔案</h1>
        <p className="muted">使用 ChatGPT 帳戶登入。第一次登入後需完成註冊、成年自我確認，以及公開資料同意，才能查看任務和提交照片。</p>
        <div className="callout warning"><strong>成人會員限定</strong><br />本服務包含會員可見的私密驗證照片與身體尺寸資料。</div>
        <a className="button primary full" href={path} target="_top">註冊／登入並繼續</a>
        <p className="fineprint">照片僅限已註冊並登入的會員讀取；平台不會將上傳照片放進公開程式碼儲存庫。</p>
      </section>
    </main>
  );
}

function ServiceError() {
  return <main className="auth-page"><section className="auth-card"><div className="brand"><span className="brand-mark">⌑</span>lockspace<span className="brand-dot">.</span></div><h1>服務暫時無法使用</h1><p className="muted">資料服務目前無法連線，請稍後重試。沒有照片或個人資料會改存到瀏覽器。</p></section></main>;
}
