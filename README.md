# smsm

A tiny shared counter: each click adds one to the all-time total, and the page remembers your clicks for the current browser tab session.

## Run locally

1. Create a Supabase project.
2. In its SQL Editor, run [`supabase/migrations/20261014000000_create_counter.sql`](supabase/migrations/20261014000000_create_counter.sql).
3. Copy `.env.example` to `.env.local` and set the project URL and anon (publishable) key from Supabase project settings.
4. Install dependencies and start Vite:

   ```sh
   npm install
   npm run dev
   ```

The anon key is intended for browser use. The database table has row-level security enabled, direct table access is revoked, and the only exposed operations are the two counter functions. Never put a Supabase service-role key in this app.

## Deploy

Deploy as a static Vite app (for example, to Vercel). Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as build environment variables. Public visitors can increment the counter, so the total counts clicks and is not protected against automated spam.
