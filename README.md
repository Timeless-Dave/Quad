# Refar

Refar is a sleek, monochrome web app for UAPB students to:

- search faculty details quickly
- preview office-map routes
- draft recommendation request emails with guided prompts

## Stack

- Next.js + React + TypeScript
- Tailwind CSS + lightweight shadcn-style components
- Supabase auth/session + relational schema assets

## Setup

1. Install dependencies: `npm install`
2. Copy env vars: `cp .env.example .env.local`
3. Fill Supabase + AI credentials.
4. Run: `npm run dev`

## MVP Routes

- `/` landing
- `/sign-in` Google OAuth entry
- `/directory` faculty lookup and office map modal
- `/draft` conversational draft assistant with copy-to-clipboard

## Deploy

Deploy to Vercel and set all env vars from `.env.example`.
