# Payload scaffold (minimal)

This folder contains a minimal Payload app scaffold for your Next.js site.

Quick start (local)

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `PAYLOAD_SECRET`.
   - We're set up to use **Postgres** (recommended for Payload full-text search).
   - If you want Cloudinary later, set `CLOUDINARY_URL` and follow comments in the collections.

2. Install dependencies and run dev:

   pnpm install
   pnpm dev

3. Visit the admin at http://localhost:3001/admin

Notes & next steps
- This scaffold uses local uploads placed in `/payload/uploads` by default. I added comments where you can swap to a Cloudinary adapter when you create an account.
- I created simple collections: `users`, `posts`, `projects`, `certifications`, `pages`, `media`, and a `settings` global.
- After you set up the DB, create your first admin user via the admin UI or script (I'll add a helper script next if you'd like).
- Next: Hooks for deterministic PDF extraction, Notion import, GitHub sync, and a preview route in Next.js (I can implement these next).
