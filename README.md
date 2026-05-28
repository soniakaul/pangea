# pangea

*A quiet way to find your people across time.*

A library globe that shows the people who matter — friends, family, teammates — wherever they are in the world, lit up when they're awake or working, dimmed when they're asleep or off-hours. Real-time sun-tracked day/night, click-to-fly camera, persistent across devices.

**→ [Live: pangea-tz.vercel.app](https://pangea-tz.vercel.app/)**

---

## What it does

- **Personal tab** — friends and family. Pins glow when they're awake; favorites are larger and pulse brighter. A "Favorites awake" card surfaces who's reachable right now.
- **Work tab** — teammates. Pins glow during their working hours. "Best 30-min meeting" finder factors in your own hours and surfaces the soonest slot where everyone's free.
- **Real-time globe** — actual solar position drives day/night lighting. Sage default, six other palettes, five gold tones for pins. All persisted per user.
- **Click anything to fly** — clicking a pin or a row arcs the camera around the globe to face that person.
- **Sign in to sync** — Google OAuth or magic link via Supabase. Your data follows you across devices. Guest mode works fully offline (localStorage).

## Stack

- **React 19** + **Vite** + **TypeScript**
- **Three.js** + **@react-three/fiber** + **@react-three/drei** for the 3D globe
- **Supabase** for auth + per-user data sync (Postgres + RLS)
- **world-atlas** GeoJSON for real continent outlines
- **PWA manifest** so it installs as a standalone Mac app

## Install as a Mac app

Pangea ships with a PWA manifest, so you can pin it to your Dock as a chromeless window — no tabs, no URL bar.

- **Safari:** *File → Add to Dock…*
- **Chrome:** *⋮ menu → Install Pangea*

Standalone window, app icon, remembers its position. Works the same in the deployed and local-dev versions.

## Run locally

```bash
git clone https://github.com/soniakaul/pangea
cd pangea
npm install
cp .env.example .env.local   # then fill in your Supabase URL + anon key
npm run dev
```

Open `http://localhost:5173`. Without env vars, sign-in won't work but guest mode (localStorage) does.

## Deploy

1. Push to GitHub
2. **vercel.com → New Project → Import** the repo
3. Add env vars in Vercel project settings (check Production + Preview + Development):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Hit Deploy

### Supabase setup (one-time)

- Create a project at [supabase.com](https://supabase.com)
- **SQL Editor**: run the `people` table schema with RLS policies (see `/docs` or ask) and `grant select, insert, update, delete on public.people to authenticated`
- **Authentication → Providers**: enable Google (OAuth Client ID from Google Cloud Console) and Email (magic link is on by default)
- **Authentication → URL Configuration**: add `http://localhost:5173` and your deployed URL to the redirect list

---

Built with care, across ovening of iterating on color palettes and microfeatures.
