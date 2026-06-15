# AGENTS.md — AI-Powered Online Exam Platform

## Quick start
- **Package manager**: `bun` — not npm/yarn/pnpm
- Dev: `bun run dev` (port 3000, logs to dev.log)
- Build: `bun run build` (produces `.next/standalone/`, Next.js `output: "standalone"`)
- Prod start: `bun run start` (runs `.next/standalone/server.js`, logs to server.log)
- Lint: `bun run lint`

## No tests
Zero test files, no test framework installed. Do not add or look for tests.

## TypeScript & linting
- `tsconfig.json`: `strict: true` but **`noImplicitAny: false`**
- `next.config.ts`: `ignoreBuildErrors: true` — TS errors do NOT block builds
- `reactStrictMode: false`
- **ESLint rules are almost all disabled** (unused-vars, explicit-any, exhaustive-deps, prefer-const, console, etc. — all off)

## View routing (NOT URL-based)
App uses **internal view switching via Zustand store**, not Next.js file-based routing:
- `useExamStore.currentView` + `setView()` drive what component renders inside `<AppShell />`
- Initial view is `'role_select'`; teacher/student role selection sets `currentView` accordingly
- `navigateBack()` pops from a local `VIEW_HISTORY` stack
- All views are defined in `src/lib/types.ts` as `AppView` type

## Current state: mock data
All teacher and student views operate on **mock data** from `src/lib/mock-data.ts`. Prisma models (Question, User) and the server action (`src/app/actions/question.ts`) exist but are not wired into the UI yet. The AI Generator (`AIGenerator.tsx`) does make real API calls to Puter.

## Icon system
**FontAwesome** is the primary icon library, used via `<FontAwesomeIcon>` and a wrapper `src/components/shared/Icon.tsx` (60+ icon mappings, stored in a `iconMap` object using `IconName` string keys). No emojis anywhere. The `components.json` says `"iconLibrary": "lucide"` but lucide-react is not actually used for rendering.

## UI framework & styling
- shadcn/ui: New York style, RSC=true, CSS variables, neutral base
- Tailwind CSS v4 (uses `@import "tailwindcss"`, `@theme inline {}`, `@custom-variant dark`)
- `@tailwindcss/postcss` plugin (not the old `tailwind.config.js` approach)
- Custom palette: Indigo (#4F46E5) primary, Slate (#F8FAFC) bg, Rose (#E11D48) destructive, Slate-800 (#1E293B) text
- Glassmorphism: `glass` and `glass-card` utility classes in globals.css (backdrop-blur + semi-transparent backgrounds)
- `gradient-text` class for indigo gradient text effects
- Custom Tailwind v4 colors: `indigo`, `indigo-light`, `indigo-dark`, `indigo-soft`, `teal`, `rose`, etc.
- Dark mode: wired up via next-themes `<ThemeProvider>` in `layout.tsx`, toggle at `src/components/shared/ThemeToggle.tsx`

## Database (Prisma v6)
- MySQL via `DATABASE_URL` env var (default: `mysql://lazisnu:lazisnu@localhost:3306/ulanganku`)
- Commands: `bun run db:push`, `bun run db:generate`, `bun run db:migrate`, `bun run db:reset`
- Two models: `Question` (cuid id, subject, grade, topic, difficulty, type, JSON content) and `User` (email, name)
- SQLite fallback at `db/custom.db`

## AI question generation
Uses **Puter.js** (`puter.ai.chat()`) with structured prompts. Endpoint: `POST /api/ai-generate`. The `AiModel` field is set to `"claude-3-5-sonnet"` by default.

## Architecture
- **Entrypoint**: `src/app/page.tsx` → renders `<AppShell />`
- **AppShell** (`src/components/app/AppShell.tsx`): 260px collapsible sidebar + header + view routing
- **RoleSelector** → sets role in store, navigates to teacher or student dashboard
- **5 question types**: `pilihan_ganda`, `pilihan_ganda_kompleks`, `menjodohkan`, `isian_singkat`, `essay`
- **Anti-cheat**: `visibilitychange` tracking, 3 strikes → auto-submit + full-screen overlay
- State: single **Zustand** store (`useExamStore`) + **TanStack React Query** for server data
- Dark mode via **next-themes** — toggle component at `src/components/shared/ThemeToggle.tsx`

## Developer scripts (shell helpers in `.zscripts/`)
- `dev.sh`: install → db:push → dev server → health check → mini-services
- `build.sh`: install → build → mini-services build → tar.gz
- `start.sh`: prod start → mini-services → Caddy reverse proxy (port 81 → 3000)

## Production deployment
- Caddy reverse proxy at `:81` forwarding to `localhost:3000`
- Also supports `?XTransformPort=` query param for dynamic port proxying

## Conventions
- Question content stored as JSON in `Question.content` (Prisma `Json` field) for flexible shape per type
- Export/import uses `xlsx` (spreadsheet format)
- Rich text editing via `@mdxeditor/editor`
- Auth (next-auth) and i18n (next-intl) deps are installed but not fully integrated
- `agent-ctx/` dir contains development task logs; `worklog.md` is the master worklog
- Icon component at `src/components/shared/Icon.tsx` — always use this instead of raw `<FontAwesomeIcon>` for consistency
- Sidebar width: 260px, uses Radix Collapsible

## Patch scripts (root)
`patch.js`, `patch_generator.js`, `patch_model.js` — Node.js scripts that hardcode find-and-replace on source files (e.g., `AIGenerator.tsx`, `ai-generate/route.ts`, `types.ts`). These contain `/home/z/my-project` hardcoded paths; handle with care.
