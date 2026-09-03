# Golden Lehnga - Bridal Couture E-Commerce

This is a [Next.js](https://nextjs.org) e-commerce application for bridal couture, built with Supabase for authentication and database management.

## Prerequisites

- Node.js 18+ installed
- A Supabase project created at [supabase.com](https://supabase.com)
- Supabase project URL and anon key

## Environment Setup

1. Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the Project URL and Anon Key

## Database Setup

1. Run the Supabase schema migration:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually run the SQL from supabase/schema.sql in your Supabase SQL Editor
```

2. Apply Row Level Security (RLS) policies:

```bash
# Run the RLS policies from supabase/rls.sql in your Supabase SQL Editor
```

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Other Platforms

Ensure you add the following environment variables to your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - React components
- `lib/supabase/` - Supabase client configuration
- `supabase/` - Database schema and RLS policies

## Tech Stack

- Next.js 16.3.3 with App Router
- Supabase for authentication and database
- React 19
- TypeScript
- Tailwind CSS 4
