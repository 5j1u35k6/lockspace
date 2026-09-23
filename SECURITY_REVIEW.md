# Lockspace security and launch review

## Implemented in this version

- Sign-in and registration are required before task data, profiles, or photos load. The first visit uses Sign in with ChatGPT, then requires a profile and consent step.
- Server routes identify members from the Sites-provided authenticated-user headers; browser-supplied user IDs are never trusted.
- Profile writes, uploads, votes, reports, and deletions reject cross-origin requests.
- Photos are stored under random object keys in a private R2 bucket and served through an authenticated route with `no-store` and `nosniff` headers.
- Uploads have a 12 MB limit and a five-per-24-hour per-account cap. The server accepts JPEG only, checks the JPEG structure, and strips common EXIF/IPTC/comment metadata.
- The browser embeds a visible, repeated watermark before transmission. The photo viewer preserves each image's aspect ratio and does not crop it.
- D1 enforces one vote per member per submission; the API also blocks self-voting. Members can report photos and delete their own photo or account, including R2 objects.
- Security response headers cover MIME sniffing, framing, referrer data, cross-origin resource reads, and unnecessary browser permissions.

## Required before opening to a wider audience

1. **Independent age assurance:** Sign in with ChatGPT proves account identity, not age. The current age step is self-attestation only. Add a suitable age-assurance provider or keep the Site access restricted.
2. **Moderation operations:** Reports are saved in D1, but there is no moderator review queue, enforcement flow, appeal process, or response-time commitment. Add named moderators and review tooling before admitting outside members.
3. **Photo-sharing expectations:** Any registered member can view a submitted proof to verify it. Watermarks do not prevent screenshots or re-sharing. Obtain explicit consent for member review and set clear retention/deletion rules.
4. **Public personal data:** Filled body dimensions, lock dimensions, skin tone, body type, height, and weight are visible to signed-in members. Keep the confirmation at registration and make removal easy.
5. **Operational recovery:** Add monitored alerts for failed uploads/deletes, R2 orphan cleanup, D1/R2 backup/restore checks, and account-abuse response. Account deletion attempts the R2 removals before deleting the profile; a failed storage call needs retry/manual cleanup.
6. **Automated security checks:** Add dependency update alerts and a repeatable API test suite for authentication, cross-origin requests, rate limits, ownership checks, image metadata removal, and deletion.

## Publication state

The hosted Site remains owner-restricted. Do not switch its access to public until the age-assurance and moderation items above are addressed. The GitHub repository is public and contains source/configuration only; no member photos, credentials, or uploaded data belong there.
