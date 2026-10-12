# ContentApp

A fast, beautiful platform for sharing your videos, photography and live shows with your followers.
No feed, no algorithms, no ads — just your art.

Built with **Next.js 16**, **Tailwind CSS v4**, **Supabase**, **Cloudinary** and **Livepeer**,
deployed on **Vercel**.

---

## Features

- **Masonry gallery** of images and videos with hover previews and a full-screen lightbox
- **Drag-and-drop uploads** with real progress tracking, multi-file queue, and metadata (title, description, tags, publish state)
- **Video hosting & adaptive streaming** via Cloudinary (auto-generated thumbnails, HLS)
- **Live streaming** — create a stream, get an RTMP key, broadcast from OBS or your phone
- **Creator dashboard** with view/like stats, publish toggling and deletion
- **Light/dark mode** with system-preference detection, saved to localStorage
- **Auth** (email + password) with protected dashboard, upload and live routes
- **Fully accessible**: keyboard navigable, labelled controls, `prefers-reduced-motion` respected
- **Mobile first** responsive design with smooth Framer Motion animations

---

## Pages

| Route           | Description                                        |
| --------------- | -------------------------------------------------- |
| `/`             | Landing page                                       |
| `/gallery`      | Public gallery, filterable by Photos / Videos      |
| `/live`         | Live stream player plus streaming setup guide      |
| `/upload`       | Upload flow (auth required)                        |
| `/dashboard`    | Content stats and management (auth required)       |
| `/dashboard/live` | Create a stream and get its RTMP key (auth)      |
| `/login`        | Sign in                                            |
| `/signup`       | Create account                                     |
| `/about`        | About page                                         |

---

## Prerequisites

You need free accounts at:

| Service        | Free tier                                    | What you need                                        |
| -------------- | -------------------------------------------- | ---------------------------------------------------- |
| Supabase       | 500 MB database, 1 GB storage, 50k MAUs      | Project URL, anon key, service role key              |
| Cloudinary     | 25 credits/month (~25 GB video or 100 GB img)| Cloud name, API key, API secret                      |
| Livepeer       | 1000 streaming minutes/month                 | API key                                              |
| Vercel         | Hobby plan                                   | —                                                    |

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

```bash
cp .env.example .env.local
```

Then fill in the values (see the table above):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdef...

LIVEPEER_API_KEY=your-livepeer-api-key
```

### 3. Create the database schema

Open your Supabase project → **SQL Editor** → **New query**, paste the contents of
`supabase/schema.sql` and run it. This creates the `profiles`, `content`, `live_streams`
and `likes` tables, the storage bucket, the row-level security policies and the
helper functions.

### 4. Make yourself an admin

Sign up through the app, then run this in the SQL Editor with your own email:

```sql
update public.profiles set is_admin = true where email = 'you@example.com';
```

### 5. Run the development server

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## Uploading content

Uploads go straight to Cloudinary and then the metadata is written to Supabase.

- Images are resized to a max of 1920×1080, `q_auto` / `f_auto` optimized.
- Videos get an auto-generated JPEG thumbnail at 00:00:01 (1280×720) and adaptive streaming.
- Files are organised under `contentapp/<user-id>/` in Cloudinary.
- Toggle **Publish immediately** to control whether a piece appears in the public gallery.

---

## Going live

1. Visit `/dashboard/live` and create a stream — this calls the Livepeer API and returns a
   real stream key plus playback URL.
2. Copy the **RTMP Ingest URL** and **Stream Key**.
3. Open [OBS Studio](https://obsproject.com/download) (free) → Settings → Stream →
   Service: **Custom**, then paste the ingest URL and key.
4. Start streaming in OBS, then click **Go Live Now** on the dashboard.
5. Viewers watch on `/live`.

---

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── content/          # Content CRUD endpoints
│   │   ├── content/[id]/     # Single content item
│   │   ├── live/             # Live stream endpoints
│   │   └── upload/           # Signed upload → Cloudinary
│   ├── dashboard/            # Creator dashboard
│   ├── gallery/              # Public gallery
│   ├── live/                 # Live streaming page
│   ├── login/ signup/        # Auth pages
│   ├── about/                # About page
│   ├── globals.css           # Tailwind v4 theme + custom utilities
│   └── layout.tsx
├── components/
│   ├── auth/                 # AuthProvider + AuthShell
│   ├── content/              # ContentCard + Lightbox
│   ├── landing/              # Hero, Features, CTA
│   └── layout/               # Header, Footer
└── lib/
    ├── cloudinary.ts         # Upload + URL helpers
    ├── db.ts                 # Typed Supabase queries
    ├── livepeer.ts           # Livepeer stream creation
    ├── supabase.ts           # Supabase client (lazy, demo-safe)
    └── types.ts
supabase/
└── schema.sql                # Database schema + RLS policies
```

---

## Deploying to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Add your environment variables when prompted (or in **Project Settings → Environment
Variables** on the dashboard).

### Option B — Git integration

1. Push this repo to GitHub.
2. Import it at <https://vercel.com/new>.
3. Add all the `.env.local` variables as Environment Variables (Production + Preview).
4. Deploy.

---

## Scripts

| Command          | Description                    |
| ---------------- | ------------------------------ |
| `npm run dev`    | Start the development server    |
| `npm run build`  | Production build                |
| `npm run start`  | Serve the production build      |
| `npm run lint`   | Run ESLint                        |

---

## Security notes

- All tables have **row-level security** enabled; users can only mutate their own rows.
- Published content is publicly readable; drafts are only visible to their author.
- The Cloudinary API secret and Livepeer API key are **server-only** — never prefix them
  with `NEXT_PUBLIC_`.
- Uploads require a valid Supabase session token.

---

## License

MIT
