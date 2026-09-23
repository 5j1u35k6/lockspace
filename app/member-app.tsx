"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

export type ProfileData = {
  displayName: string;
  pronouns: string | null;
  bio: string | null;
  lockBrand: string | null;
  lockColor: string | null;
  cageLengthCm: string | null;
  cageWidthCm: string | null;
  bodyLengthCm: string | null;
  bodyGirthCm: string | null;
  heightCm: string | null;
  weightKg: string | null;
  skinTone: string | null;
  bodyType: string | null;
};

type Post = {
  id: string;
  imageUrl: string;
  createdAt: number;
  isMine: boolean;
  profile: ProfileData;
  passCount: number;
  retryCount: number;
  myVote: "pass" | "retry" | null;
};

type Community = {
  task: { date: string; code: string; instruction: string } | null;
  posts: Post[];
  member: { userId: string; displayName: string };
};

export function RegistrationForm({
  initialName,
  initialProfile,
  onSaved,
}: {
  initialName?: string;
  initialProfile?: ProfileData;
  onSaved?: (profile: ProfileData) => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    data.adultConfirmed = String(form.querySelector<HTMLInputElement>('[name="adultConfirmed"]')?.checked ?? false);
    data.publicDataConsent = String(form.querySelector<HTMLInputElement>('[name="publicDataConsent"]')?.checked ?? false);
    setBusy(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          adultConfirmed: data.adultConfirmed === "true",
          publicDataConsent: data.publicDataConsent === "true",
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "無法儲存，請稍後重試。");
      const saved: ProfileData = {
        displayName: data.displayName,
        pronouns: data.pronouns || null,
        bio: data.bio || null,
        lockBrand: data.lockBrand || null,
        lockColor: data.lockColor || null,
        cageLengthCm: data.cageLengthCm || null,
        cageWidthCm: data.cageWidthCm || null,
        bodyLengthCm: data.bodyLengthCm || null,
        bodyGirthCm: data.bodyGirthCm || null,
        heightCm: data.heightCm || null,
        weightKg: data.weightKg || null,
        skinTone: data.skinTone || null,
        bodyType: data.bodyType || null,
      };
      if (onSaved) onSaved(saved);
      else window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "網路錯誤，請稍後重試。");
    } finally {
      setBusy(false);
    }
  }

  const profile = initialProfile;
  return (
    <main className="registration-page">
      <form className="registration-card" onSubmit={submit}>
        <div className="brand"><span className="brand-mark">⌑</span>lockspace<span className="brand-dot">.</span></div>
        <p className="eyebrow">MEMBER REGISTRATION</p>
        <h1>{profile ? "編輯公開會員檔案" : "完成註冊"}</h1>
        <p className="muted">登入帳戶已確認。填寫會員資料後才能進入任務區；標有「公開」的資料會供已註冊會員查看。</p>

        <div className="form-section"><h2>基本資料</h2><div className="form-grid">
          <Field label="公開顯示名稱" name="displayName" defaultValue={profile?.displayName ?? initialName ?? ""} required maxLength={32} />
          <Field label="代名詞（選填）" name="pronouns" defaultValue={profile?.pronouns ?? ""} maxLength={32} />
          <Field label="身高（公開）" name="heightCm" type="number" defaultValue={profile?.heightCm ?? ""} unit="cm" min="0" max="260" step="1" />
          <Field label="體重（公開）" name="weightKg" type="number" defaultValue={profile?.weightKg ?? ""} unit="kg" min="0" max="400" step="0.1" />
          <Field label="膚色（公開）" name="skinTone" defaultValue={profile?.skinTone ?? ""} maxLength={40} />
          <Field label="身材（公開）" name="bodyType" defaultValue={profile?.bodyType ?? ""} maxLength={60} />
        </div><label className="field-label" htmlFor="bio">自我介紹（選填）</label><textarea id="bio" name="bio" rows={3} maxLength={240} defaultValue={profile?.bio ?? ""} /></div>

        <div className="form-section"><h2>貞操鎖資料 <span className="public-tag">公開</span></h2><div className="form-grid">
          <Field label="品牌" name="lockBrand" defaultValue={profile?.lockBrand ?? ""} maxLength={64} />
          <Field label="顏色" name="lockColor" defaultValue={profile?.lockColor ?? ""} maxLength={32} />
          <Field label="籠長" name="cageLengthCm" type="number" defaultValue={profile?.cageLengthCm ?? ""} unit="cm" min="0" max="80" step="0.1" />
          <Field label="籠寬" name="cageWidthCm" type="number" defaultValue={profile?.cageWidthCm ?? ""} unit="cm" min="0" max="80" step="0.1" />
        </div></div>

        <div className="form-section"><h2>未配戴時身體尺寸 <span className="public-tag">公開</span></h2><div className="form-grid">
          <Field label="陰莖長度" name="bodyLengthCm" type="number" defaultValue={profile?.bodyLengthCm ?? ""} unit="cm" min="0" max="80" step="0.1" />
          <Field label="陰莖周長" name="bodyGirthCm" type="number" defaultValue={profile?.bodyGirthCm ?? ""} unit="cm" min="0" max="80" step="0.1" />
        </div></div>

        <div className="callout warning"><strong>公開範圍提醒</strong><br />鎖具品牌、籠具尺寸與顏色、身體尺寸、膚色、身材、身高及體重都會顯示在會員公開檔案。留白的欄位不會顯示。登入只識別帳戶，不代表完成政府證件年齡驗證。</div>
        <label className="check-row"><input type="checkbox" name="adultConfirmed" required /><span>我已年滿 18 歲，並確認我的會員帳戶由我本人使用。</span></label>
        <label className="check-row"><input type="checkbox" name="publicDataConsent" required /><span>我同意以上已填資料公開給平台會員；我可以之後刪除或修改。</span></label>
        {error && <p className="error-message" role="alert">{error}</p>}
        <button className="button primary full" disabled={busy}>{busy ? "儲存中…" : profile ? "儲存公開檔案" : "完成註冊並進入任務"}</button>
      </form>
    </main>
  );
}

function Field({
  label, name, defaultValue, type = "text", unit, ...inputProps
}: {
  label: string; name: string; defaultValue: string; type?: string; unit?: string;
  required?: boolean; maxLength?: number; min?: string | number; max?: string | number; step?: string | number;
}) {
  return <label className="field-label">{label}<span className="input-with-unit"><input name={name} type={type} defaultValue={defaultValue} {...inputProps} />{unit && <span>{unit}</span>}</span></label>;
}

export function MemberDashboard({ profile: initialProfile }: { profile: ProfileData }) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<Community | null>(null);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [uploadConsent, setUploadConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/community", { cache: "no-store" });
      const result = await response.json() as Community & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "任務載入失敗。");
      setData(result);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "任務載入失敗。");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function choosePhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 12 * 1024 * 1024) {
      setError("請選擇 12 MB 以內的圖片。");
      return;
    }
    try {
      const watermarked = await watermark(file);
      setPhoto(watermarked);
      setPreview(URL.createObjectURL(watermarked));
      setError("");
    } catch {
      setError("無法處理這張圖片，請換一張再試。");
    }
  }

  async function submitPhoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo || !uploadConsent) return setError("請選照片並確認成年、所有權與分享同意。 ");
    const formElement = event.currentTarget;
    setBusy(true); setError("");
    const body = new FormData();
    body.set("photo", photo, "lockspace-proof.jpg");
    body.set("adultConsent", "yes");
    body.set("ownershipConsent", "yes");
    try {
      const response = await fetch("/api/submissions", { method: "POST", body });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "照片上傳失敗。");
      setPhoto(null); setPreview(""); setUploadConsent(false);
      formElement.reset();
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "照片上傳失敗。");
    } finally { setBusy(false); }
  }

  async function vote(post: Post, result: "pass" | "retry") {
    try {
      const response = await fetch("/api/votes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submissionId: post.id, result }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "無法儲存驗證結果。");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "無法儲存驗證結果。"); }
  }

  async function removePost(post: Post) {
    if (!window.confirm("刪除後，照片會從私人儲存區移除；此動作無法復原。要繼續嗎？")) return;
    const response = await fetch(`/api/submissions/${post.id}`, { method: "DELETE" });
    const body = await response.json() as { error?: string };
    if (!response.ok) return setError(body.error ?? "刪除失敗。");
    await load();
  }

  async function reportPost(post: Post) {
    const reason = window.prompt("檢舉原因：輸入 1 未成年疑慮、2 未經同意、3 冒用、4 騷擾、5 其他");
    const reasons: Record<string, string> = { "1": "underage", "2": "nonconsensual", "3": "impersonation", "4": "harassment", "5": "other" };
    if (!reason || !reasons[reason.trim()]) return;
    const response = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ submissionId: post.id, reason: reasons[reason.trim()] }) });
    const body = await response.json() as { error?: string };
    setError(response.ok ? "已收到檢舉。" : body.error ?? "檢舉送出失敗。");
  }

  async function deleteAccount() {
    if (!window.confirm("永久刪除你的會員檔案、任務照片及驗證紀錄？照片將從私人儲存區移除。此操作無法復原。")) return;
    const response = await fetch("/api/account", { method: "DELETE" });
    const body = await response.json() as { error?: string };
    if (!response.ok) return setError(body.error ?? "帳戶刪除失敗。");
    window.location.assign("/signout-with-chatgpt?return_to=%2F");
  }

  if (editing) return <RegistrationForm initialProfile={profile} onSaved={(saved) => { setProfile(saved); setEditing(false); void load(); }} />;

  const signOut = "/signout-with-chatgpt?return_to=%2F";
  return (
    <main className="site-shell">
      <header className="topbar"><div className="brand"><span className="brand-mark">⌑</span>lockspace<span className="brand-dot">.</span></div><div className="header-actions"><span className="member-chip">{profile.displayName} · 已註冊</span><button className="button secondary" onClick={() => setEditing(true)}>編輯公開檔案</button><a className="button quiet" href={signOut} target="_top">登出</a></div></header>
      <div className="callout caution"><strong>成人會員限定。</strong>驗證影像含個人私密內容，只供已登入會員查看；上傳前確認影像中的每位成年人都同意提交。網站無法防止收件者截圖。</div>
      {error && <p className="error-message" role="alert">{error}</p>}
      <div className="dashboard-grid"><section className="main-column">
        <div className="page-title"><div><p className="eyebrow">TODAY · ASIA/TAIPEI</p><h1>今日唯一任務</h1><p className="muted">每天一項任務。完成後提交證明，其他會員可檢視並驗證。</p></div><button className="button primary" onClick={() => document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" })}>上傳驗證照片</button></div>
        <section className="task-panel"><div className="task-label">ONE TASK TODAY</div><h2>{data?.task?.instruction ?? "將今日隨機數字寫在紙條上，與鎖具外觀同框拍照。"}</h2><div className="task-code">{data?.task?.code?.replace(/(\d{3})(\d{3})/, "$1 $2") ?? "··· ···"}</div><p className="muted">將此驗證碼手寫在紙條上，與鎖具外觀同框。避免拍入臉部、住址與其他識別資料。</p></section>
        <form id="upload" className="upload-panel" onSubmit={submitPhoto}><div className="section-heading"><div><h2>提交照片</h2><p className="muted">浮水印會嵌入照片；畫面依原始長寬比例呈現。</p></div><span className="private-tag">登入會員可見</span></div>
          <label className="upload-picker">選擇圖片（JPEG、PNG、WebP，12 MB 以內）<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void choosePhoto(event.target.files?.[0])} /></label>
          {preview && <figure className="preview-frame"><img src={preview} alt="已嵌入浮水印的照片預覽" /><figcaption>LOCKSPACE · 任務驗證浮水印已嵌入</figcaption></figure>}
          <label className="check-row"><input type="checkbox" checked={uploadConsent} onChange={(event) => setUploadConsent(event.target.checked)} /><span>我已年滿 18 歲，是照片中的本人或取得所有入鏡成年人的明確同意，並同意將照片提供給已註冊會員驗證。我理解照片可能被截圖。</span></label>
          <button className="button primary" disabled={busy || !photo}>{busy ? "加密傳送中…" : "上傳並提交驗證"}</button>
        </form>
        <section className="feed"><div className="section-heading"><div><h2>今日提交</h2><p className="muted">僅已完成註冊並登入的會員可查看照片。</p></div><button className="button secondary" onClick={() => void load()}>重新整理</button></div>
          {data?.posts.length === 0 && <div className="empty-state">今天還沒有人提交。你可以成為第一位。</div>}
          {!data && !error && <div className="empty-state">載入今日任務…</div>}
          {data?.posts.map((post) => <article className="submission-card" key={post.id}>
            <div className="post-head"><div><strong>{post.profile.displayName}</strong><span className="muted">{post.profile.pronouns ? ` · ${post.profile.pronouns}` : ""} · {new Date(post.createdAt).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}</span></div><span className="private-tag">會員可見</span></div>
            <div className="public-details"><span>{post.profile.lockBrand || "未填品牌"}</span><span>{post.profile.lockColor || "未填顏色"}</span><span>籠 {post.profile.cageLengthCm || "—"} × {post.profile.cageWidthCm || "—"} cm</span><span>身高 {post.profile.heightCm || "—"} cm</span><span>體重 {post.profile.weightKg || "—"} kg</span><span>未配戴長／周長 {post.profile.bodyLengthCm || "—"}／{post.profile.bodyGirthCm || "—"} cm</span><span>{post.profile.skinTone || "未填膚色"}</span><span>{post.profile.bodyType || "未填身材"}</span></div>
            <div className="image-stage"><img src={post.imageUrl} alt="會員提交的任務驗證照片" loading="lazy" /></div>
            <div className="vote-bar"><button className="button secondary" disabled={post.isMine || Boolean(post.myVote)} onClick={() => void vote(post, "pass")}>✓ 通過 ({post.passCount})</button><button className="button secondary" disabled={post.isMine || Boolean(post.myVote)} onClick={() => void vote(post, "retry")}>↻ 請補件 ({post.retryCount})</button>{post.isMine ? <button className="button danger" onClick={() => void removePost(post)}>刪除我的照片</button> : <button className="button quiet" onClick={() => void reportPost(post)}>檢舉</button>}</div>
          </article>)}
        </section>
      </section><aside className="side-column"><section className="profile-card"><p className="eyebrow">公開會員檔案</p><h2>{profile.displayName}</h2><p className="muted">{profile.pronouns || "未填代名詞"}</p><dl className="profile-list"><Row label="貞操鎖品牌" value={profile.lockBrand} /><Row label="顏色" value={profile.lockColor} /><Row label="籠長 × 籠寬" value={pair(profile.cageLengthCm, profile.cageWidthCm, "cm")} /><Row label="未配戴長度／周長" value={pair(profile.bodyLengthCm, profile.bodyGirthCm, "cm")} /><Row label="身高" value={format(profile.heightCm, "cm")} /><Row label="體重" value={format(profile.weightKg, "kg")} /><Row label="膚色" value={profile.skinTone} /><Row label="身材" value={profile.bodyType} /></dl><p className="fineprint">以上已填資料會顯示給已註冊會員。</p></section><section className="profile-card"><h3>影像安全</h3><ul className="safety-list"><li>僅允許成年本人自願上傳，禁止未經同意或未成年影像。</li><li>圖片存於非公開儲存區，須登入註冊後才可讀取。</li><li>照片會去除常見相機位置中繼資料並加上浮水印。</li><li>可刪除自己的照片；使用者可檢舉疑似違規內容。</li></ul><button className="button danger" onClick={() => void deleteAccount()}>刪除會員帳戶與全部資料</button></section></aside></div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return <div className="profile-row"><dt>{label}</dt><dd>{value || "未填"}</dd></div>;
}

function format(value: string | null, unit: string) { return value ? `${value} ${unit}` : null; }
function pair(a: string | null, b: string | null, unit: string) { return a || b ? `${a || "—"} × ${b || "—"} ${unit}` : null; }

async function watermark(file: File): Promise<File> {
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    context.drawImage(image, 0, 0);
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(-Math.PI / 8);
    context.font = `700 ${Math.max(18, Math.round(canvas.width * 0.025))}px sans-serif`;
    context.fillStyle = "rgba(255,255,255,.52)";
    context.strokeStyle = "rgba(0,0,0,.55)";
    context.lineWidth = Math.max(2, Math.round(canvas.width * 0.002));
    const mark = `LOCKSPACE · ${new Date().toLocaleDateString("zh-TW")} · 任務驗證`;
    const stepX = Math.max(260, Math.round(canvas.width * 0.55));
    const stepY = Math.max(110, Math.round(canvas.width * 0.12));
    for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
      for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
        context.strokeText(mark, x, y);
        context.fillText(mark, x, y);
      }
    }
    context.restore();
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Image encode failed")), "image/jpeg", 0.9));
    return new File([blob], "lockspace-proof.jpg", { type: "image/jpeg" });
  } finally { URL.revokeObjectURL(source); }
}
