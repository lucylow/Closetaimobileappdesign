# CLOSET A.I.

## Overview

CLOSET A.I. is a personal wardrobe stylist mobile app built with Expo (React Native) and a Node.js/Express backend. Users can catalog their clothing items, receive AI-powered outfit suggestions, virtually try on outfits, and generate social media captions for their looks. The app runs as a full-stack application on Replit with an Express server serving both the API and (in production) the static web build.

The project supports three platforms (iOS, Android, Web) from a single codebase using Expo Router for file-based navigation. It features a demo/guest mode so users can explore functionality without authentication, and integrates OpenAI (via Replit AI Integrations) for outfit explanations, caption generation, and outfit suggestion intelligence.

## Recent Changes

- **AI Confidence Scores**: Outfit suggestions now include a 0.0-1.0 confidence score with visual badges (Perfect/Great/Good). Weather and style profile context feed into the AI prompt.
- **Multi-Tone/Platform Content**: Caption generation supports 5 tones (casual, playful, professional, trendy, minimal) and 4 platforms (Instagram, TikTok, Twitter, Pinterest) with platform-specific character limits and style.
- **AI Auto-Tagging**: Wardrobe items are auto-tagged by GPT-4o-mini on creation. Manual re-tag via `/api/wardrobe/:id/auto-tag`.
- **Style Insights**: `/api/ai/style-insight` analyzes the user's wardrobe and returns dominant style, insight text, and a suggestion.
- **Virtual Try-On**: Uses `gpt-image-1` for AI-generated try-on results. Processing screen with step indicators and before/after comparison.
- **Frontend Upgrades**: Outfits screen has occasion picker, score badges, "Why this?" link; Content Studio has tone/platform selectors and preview card; Home screen has style insights card, credit badge, wardrobe glance section.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture (`newArchEnabled: true`) and React Compiler experiment.
- **Routing**: Expo Router v6 with file-based routing. The `app/` directory defines all screens:
  - `app/(tabs)/` — Main tab navigation with 5 tabs: Home, Wardrobe, Outfits, Try-On, Content.
  - `app/onboarding.tsx` — First-run onboarding carousel.
  - `app/add-item.tsx` — Modal for adding wardrobe items (image picker + form).
  - `app/outfit-detail.tsx` — Modal showing outfit details with rating/saving.
  - `app/settings.tsx` — Settings modal with theme toggle and account management.
  - `app/tryon-result.tsx` — Modal displaying virtual try-on results.
- **State Management**: React Context (`contexts/AppContext.tsx`) manages all app state including wardrobe items, outfits, saved outfits, authentication, demo mode, theme, and credits. Uses AsyncStorage for persistence.
- **Data Fetching**: TanStack React Query (`@tanstack/react-query`) with a custom `apiRequest` helper in `lib/query-client.ts` that handles auth tokens and API base URL resolution.
- **Styling**: Custom theme system (`constants/colors.ts` + `lib/useTheme.ts`) with light/dark mode support. Uses warm, fashion-oriented color palette (rose, cream, charcoal tones). Typography uses the Outfit Google Font family (Light through Bold weights).
- **Animations**: React Native Reanimated for entrance animations (FadeInUp, FadeIn, etc.).
- **Key Libraries**: expo-image (optimized image rendering), expo-haptics (tactile feedback), expo-image-picker (camera/gallery), expo-clipboard, expo-linear-gradient, expo-blur/glass-effect.

### Backend (Express + Node.js)

- **Server**: Express v5 running on port 5000 (`server/index.ts`). Handles CORS for Replit domains and localhost development.
- **API Design**: RESTful routes registered in `server/routes.ts`:
  - `POST /api/auth/guest` — Create guest user and session token.
  - Wardrobe CRUD endpoints (authenticated).
  - Outfit generation and management endpoints.
  - Try-on job creation and status.
  - Content/caption generation endpoints.
- **Authentication**: Token-based auth with sessions stored in PostgreSQL. Tokens are passed via `Authorization: Bearer <token>` header. Demo mode bypasses auth entirely (`DEMO_MODE=true` env var).
- **Storage Layer**: `server/storage.ts` implements `IStorage` interface wrapping all database operations using Drizzle ORM queries with proper user-scoping.

### Database (PostgreSQL + Drizzle ORM)

- **ORM**: Drizzle ORM with Neon serverless PostgreSQL driver (`@neondatabase/serverless` with WebSocket support).
- **Schema** (`shared/schema.ts`): Core tables include:
  - `users` — User accounts (guest or authenticated) with style profile JSON.
  - `sessions` — Auth tokens with expiration.
  - `wardrobe_items` — Clothing items with category, color, brand, image URL, tags, usage tracking.
  - `outfits` — AI-generated outfit combinations linking to wardrobe items.
  - `tryon_jobs` — Virtual try-on processing jobs with status tracking.
  - `content_jobs` — Caption/hashtag generation jobs.
  - `usage_credits` — Credit-based usage tracking.
  - `conversations` / `messages` — Chat history tables (from Replit integrations).
- **Migrations**: Managed via `drizzle-kit push` command. Config in `drizzle.config.ts`.
- **Schema Validation**: Uses `drizzle-zod` for generating Zod schemas from Drizzle table definitions.

### AI Integration

- **Provider**: OpenAI API accessed through Replit AI Integrations (custom base URL via `AI_INTEGRATIONS_OPENAI_BASE_URL`).
- **Features** (`server/ai.ts`):
  - `generateOutfitExplanation` — Explains why outfit pieces work together (gpt-4o-mini).
  - `generateCaptionAndHashtags` — Social media caption + hashtag generation.
  - `generateOutfitSuggestions` — AI-powered outfit combination suggestions from wardrobe.
- **Image Generation**: Available via `server/replit_integrations/image/` using `gpt-image-1` model.
- **Audio/Voice**: Replit integration modules for voice chat (audio routes, recording, playback, streaming).

### Build & Development

- **Development**: Two processes run simultaneously:
  - `expo:dev` — Expo Metro bundler for the React Native app.
  - `server:dev` — Express backend via `tsx` for TypeScript execution.
- **Production Build**: 
  - `expo:static:build` — Custom build script (`scripts/build.js`) for static web export.
  - `server:build` — esbuild bundles server to `server_dist/`.
  - `server:prod` — Runs production server which serves static files.
- **Patch Package**: `postinstall` runs `patch-package` for any dependency patches.

### Shared Code

- The `shared/` directory contains schema definitions used by both frontend (for types) and backend (for database operations). Path alias `@shared/*` maps to `./shared/*`.

## External Dependencies

- **PostgreSQL** (via `DATABASE_URL` env var): Primary database, accessed through Neon serverless driver. Required for all data persistence.
- **OpenAI API** (via Replit AI Integrations): Powers outfit explanations, caption generation, outfit suggestions, and image generation. Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables.
- **Replit Environment**: Relies on Replit-specific env vars (`REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, `REPLIT_INTERNAL_APP_DOMAIN`) for CORS configuration and URL resolution.
- **AsyncStorage** (`@react-native-async-storage/async-storage`): Client-side persistence for auth tokens, user preferences, and cached data.
- **Expo Services**: expo-image-picker for photo capture, expo-haptics for tactile feedback, expo-crypto for UUID generation on client.