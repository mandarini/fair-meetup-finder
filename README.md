# FairMeet

Find the fairest meeting point for a group of people based on real travel time and distance.

## Features

- **Fair meeting point** -- calculates the optimal location that minimizes travel for everyone
- **Two algorithms** -- "Fair Total" (geometric median, minimizes total distance) and "Fair Max" (minimax, minimizes the longest individual trip)
- **Real travel times** -- uses Google Directions API for walking, transit, or driving routes
- **Venue suggestions** -- find the nearest cafe, restaurant, or bar to the meeting point
- **Google Maps links** -- open the meeting point or suggested venue directly in Google Maps
- **Friends list** -- save your friends' locations and quickly add them to a meetup (requires sign-in)
- **Google sign-in** -- authentication via Supabase with Google OAuth
- **Address search** -- autocomplete powered by Google Places
- **Drag & drop markers** -- fine-tune locations by dragging pins on the map

## Tech Stack

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) (Maps, Places, Directions)
- [Supabase](https://supabase.com) (Auth + PostgreSQL)
- [TanStack React Query](https://tanstack.com/query)

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Cloud project with these APIs enabled:
  - Maps JavaScript API
  - Places API
  - Directions API
- A Supabase project (free tier works)

### 1. Clone and install

```sh
git clone https://github.com/mandarini/fair-meetup-finder.git
cd fair-meetup-finder
npm install
```

### 2. Set up environment variables

```sh
cp .env.example .env
```

Edit `.env` and add your keys:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migration.sql` (or use the SQL Editor in the Supabase Dashboard)
3. Enable **Google** as an auth provider in Authentication > Providers
4. Add your app's callback URLs in Authentication > URL Configuration:
   - `http://localhost:5173/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)

### 4. Set up Google OAuth

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized JavaScript origins: your app URL + `http://localhost:5173`
4. Add authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
5. Copy Client ID + Secret into Supabase Dashboard > Auth > Providers > Google

### 5. Run

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Deploying to Netlify

Set these environment variables in Netlify > Site settings > Environment variables:

| Variable | Value |
|----------|-------|
| `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps API key |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/publishable key |

Build command: `npm run build`
Publish directory: `dist`

## Database Schema

The app uses these Supabase tables (all protected by Row Level Security):

- **profiles** -- auto-created on sign-up via database trigger
- **friends** -- saved contacts with name + location
- **groups** / **group_members** -- organize friends into groups
- **meetup_history** -- saved meetup calculations with optional shareable links

## How the Algorithms Work

**Geometric Median (Fair Total)** -- Uses [Weiszfeld's algorithm](https://en.wikipedia.org/wiki/Geometric_median) to find the point that minimizes the sum of distances to all participants. Best when you want to minimize total group travel.

**Minimax Center (Fair Max)** -- Finds the point that minimizes the maximum distance any single person has to travel. Best when fairness to the person with the longest commute matters most.

Both algorithms use the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula) for geographic distance calculations. When a travel mode is selected, the app refines results using actual route data from the Google Directions API.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint with ESLint |

## License

MIT
