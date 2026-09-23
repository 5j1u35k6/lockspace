# Lockspace

An adult-member task verification app. Visitors must sign in with ChatGPT and complete the Lockspace member registration before seeing the task feed or member photos. A new registration includes an 18+ self-attestation and explicit consent to show filled profile fields to registered members.

## Features

- One randomly generated six-digit task code per day in Asia/Taipei.
- Public-to-members profile fields for lock brand, lock color, cage length/width, uncaged length/girth, height, weight, skin tone, and body type.
- Browser watermarking before upload; the watermarked JPEG keeps its aspect ratio and is shown without cropping.
- Server-side stripping of common JPEG EXIF, IPTC, and comment segments.
- Random object keys in a private R2 bucket. Photos are streamed only through an authenticated route to registered members; no public bucket URL is used.
- One vote per member per submission, no self-voting, report submission, deletion of one's own posts, and account deletion.
- Upload size cap and per-account upload rate limit.

## Development

Requires Node.js 22.13 or newer.

```sh
npm ci
npm run db:generate
npm run build
```

For local development, use the Sites preview workflow. The starter has a development-only mock sign-in at `/signin-with-chatgpt?return_to=/`. Mock sign-in is not included in production.

The app expects a D1 binding named `DB` and a private R2 binding named `BUCKET`, declared in `.openai/hosting.json`. Sites creates and connects those resources during publication; do not make the bucket public. D1 schema changes live in `db/schema.ts` and generated migrations in `drizzle/`.

## Image and privacy boundaries

Uploaded photos are stored in R2, not in this repository. Only registered, signed-in members can read verification photos. Members may still save or screenshot images after viewing them; the app cannot prevent that. The watermark is a deterrent and attribution aid, not access control.

ChatGPT sign-in identifies an account but does not independently verify a person's age. The current flow only has an 18+ self-attestation. Keep the hosted Site owner-restricted until an appropriate age-assurance process, operating rules, and report-review process are in place. Reports are recorded in D1 but this version does not include a moderator console or automatic takedown workflow.

Filled profile measurements are visible to signed-in registered members as requested. Do not use production data in local development or commit personal data, uploaded images, or credentials to GitHub.
