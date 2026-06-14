# Revision Scheduler

A smart spaced-repetition study planner for university students. Built with
**Next.js 14** (App Router), **Supabase** (auth + Postgres), **Tailwind CSS**,
and **Recharts**. Implements the **SM-2** algorithm — the same one behind Anki —
to schedule reviews and adapt automatically when you fall behind or mark
topics as difficult.

## Features

- Email/password auth via Supabase
- Add exams (subject + date + colour) and per-exam topics (Easy / Medium / Hard)
- Generates a day-by-day schedule based on:
  - Days until each exam
  - Topic difficulty (harder topics get more initial sessions)
  - Your daily study-hour cap
  - Weekend preference
- Dashboard with today's plan, upcoming exams, and a week strip
- Study mode with running timer, four-button rating prompt, and automatic
  SM-2 next-review insertion
- Adaptive rescheduling banner for missed sessions
- Month-view calendar with subject-coloured dots and exam markers
- Progress page with streak counter, weekly bar chart, per-subject confidence
  bars, and topic-mastery table
- Fully mobile responsive — bottom tab bar on small screens

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| DB + Auth | Supabase (free tier) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Dates | date-fns |
| Tests | Vitest |
| Deploy | Vercel |

No paid APIs are used.

## Setup

### 1. Install

```bash
npm install
```

### 2. Supabase

1. Create a free project at https://supabase.com.
2. In **SQL editor**, paste and run [`schema.sql`](./schema.sql). This creates
   the four tables and the Row Level Security policies that ensure each user
   can only see their own data.
3. Copy your project URL and anon key into `.env.local`:

```bash
cp .env.example .env.local
# then edit .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Run

```bash
npm run dev
```

Visit http://localhost:3000.

### 4. Test

```bash
npm test
```

Runs the SM-2 algorithm unit tests.

## SM-2 Algorithm

Implemented in [`src/lib/sm2.ts`](./src/lib/sm2.ts) with unit tests in
[`src/lib/sm2.test.ts`](./src/lib/sm2.test.ts).

| Rating | Label | Effect |
|---|---|---|
| 1 | Blackout | Reset reps, review tomorrow |
| 2 | Hard | Ease −0.2, review in ~2 days |
| 3 | Good | Ease unchanged, review in ~7 days |
| 4 | Easy | Ease +0.1, review in ~14 days |

Ease factor clamps between 1.3 and 4.0; first review is always 1 day,
second is 3, subsequent scale with ease.

## Schedule Generator

[`src/lib/generateSchedule.ts`](./src/lib/generateSchedule.ts) distributes
initial sessions across available days, ordered by exam date and topic
difficulty, respecting the user's daily hour cap. It always deletes any
existing incomplete sessions for the affected topics before regenerating to
avoid duplicates.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the repo on https://vercel.com.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the
   Vercel project settings.
4. In Supabase **Authentication → URL configuration**, add your Vercel domain
   to the allowed redirect URLs (including `/auth/callback`).
5. Deploy.

## Project Structure

```
src/
  app/
    auth/           login, signup, callback, logout
    dashboard/      today's plan, banner, week strip
    exams/          list, add modal, [id] topic editor + generate button
    schedule/       month calendar
    study/[id]/     timer + rating buttons
    progress/       streak, charts, mastery table
    settings/       preferences form
    layout.tsx      root layout with nav
  components/       ExamCard, SessionCard, RatingButtons, StreakCounter,
                    WeekStrip, ConfidenceBar, NavBar
  lib/
    sm2.ts          SM-2 algorithm
    sm2.test.ts     unit tests
    generateSchedule.ts
    colors.ts       subject palette
    supabase/       client, server, middleware, types
  middleware.ts     route protection
schema.sql          Postgres schema + RLS
```

## Licence

MIT.
