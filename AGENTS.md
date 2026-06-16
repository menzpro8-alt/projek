# AGENTS.md — AI-Powered Online Exam Platform

## Quick start
- **Package manager**: `bun` — not npm/yarn/pnpm
- Dev: `bun run dev` (port 3000, logs to dev.log)
- Build: `bun run build` (produces `.next/standalone/`)
- Prod start: `bun run start` (runs `.next/standalone/server.js`, logs to server.log)
- Lint: `bun run lint`

## No tests
Zero tests, no test framework. Do not add tests.

## TypeScript & linting
- `tsconfig.json`: `strict: true` but **`noImplicitAny: false`**
- `next.config.ts`: `ignoreBuildErrors: true` — TS errors do NOT block builds
- `reactStrictMode: false`
- **ESLint rules are almost all disabled**: no-explicit-any, unused-vars, exhaustive-deps, prefer-const, console, etc. — all off

## View routing (NOT URL-based)
App uses **internal view switching via Zustand store**, not Next.js file-based routing:
- `useExamStore.currentView` + `setView()` determine what renders inside `<AppShell />`
- Initial view is `'role_select'`; `setRole()` sets `currentView` to `teacher_dashboard` or `student_dashboard`
- `navigateBack()` pops from `VIEW_HISTORY` module-level array
- All views defined in `src/lib/types.ts` as `AppView` type
- `student_exam` and `student_results` render full-screen (no sidebar)

## State: mock data
All views operate on **mock data** from `src/lib/mock-data.ts`. Prisma models and the server action (`src/app/actions/question.ts`) exist but are not wired into the UI. The AI Generator makes real API calls to Puter.

## Question types
- `QuestionType` union in `types.ts` only includes **3** types: `pilihan_ganda`, `pilihan_ganda_kompleks`, `menjodohkan`
- But the codebase extensively uses **5** types as string literals (in components, API route, student renderer): `isian_singkat` and `essay` are in wide use despite not being in the union
- `QUESTION_TYPE_LABELS` and `QUESTION_TYPE_ICONS` only define 3 entries — missing `isian_singkat` and `essay`
- Question content stored as JSON in Prisma `Question.content` for flexible shape per type

## Icon system
- Uses **FontAwesome** via `FontAwesomeIcon` and a wrapper `src/components/shared/Icon.tsx`
- The `Icon` component uses `findIconDefinition({ prefix: 'fas', iconName })` directly — it takes **FontAwesome icon names** as the `icon` prop (e.g., `"chart-bar"`, `"file-lines"`, `"graduation-cap"`)
- An exported `ICON_MAP` (60+ entries) maps `fa*` keys to FontAwesome icon names, with `getIconName()` helper
- Always use `<Icon icon="icon-name" />` instead of raw `<FontAwesomeIcon>` for consistency
- `components.json` says `"iconLibrary": "lucide"` but lucide-react is not used for rendering

## UI framework & styling
- shadcn/ui: New York style, RSC=true, CSS variables, neutral base
- Tailwind CSS v4 (`@import "tailwindcss"`, `@theme inline {}`, `@custom-variant dark`)
- `@tailwindcss/postcss` plugin (not the old `tailwind.config.js`)
- Custom palette: Indigo (#4F46E5) primary, Slate (#F8FAFC) bg, Rose (#E11D48) destructive
- Glassmorphism: `glass` and `glass-card` utility classes (backdrop-blur + semi-transparent)
- Dark mode via **next-themes** with `<ThemeProvider>` in `layout.tsx`, toggle at `src/components/shared/ThemeToggle.tsx`

## Database (Prisma v6)
- **Schema**: MySQL via `DATABASE_URL` env var (default: `mysql://lazisnu:lazisnu@localhost:3306/ulanganku`)
- **Production fallback**: `start.sh` uses SQLite (`file:`) if `DATABASE_URL` is unset — expects `db/custom.db` to exist
- Commands: `bun run db:push`, `bun run db:generate`, `bun run db:migrate`, `bun run db:reset`
- Two models: `Question` (cuid id, subject, grade, topic, difficulty, type, JSON content) and `User` (email, name)

## AI question generation
- Uses **Puter.js** (`puter.ai.chat()`) via `POST /api/ai-generate`
- Default model: `"claude-3-5-sonnet"` (set in store state `aiModel`)

## Architecture
- **Entrypoint**: `src/app/page.tsx` → renders `<AppShell />`
- **AppShell** (`src/components/app/AppShell.tsx`): 260px collapsible sidebar + header + view routing
- **RoleSelector** → sets role in store, navigates to teacher or student dashboard
- **Anti-cheat**: `visibilitychange` tracking, 3 strikes → `showAntiCheatOverlay: true`
- State: single **Zustand** store (`useExamStore`) + **TanStack React Query** for server data
- **5 teacher views**: dashboard, exam manager, question bank, question editor, import, AI generator, live monitor
- **3 student views**: dashboard, exam view, results
- Export/import uses `xlsx` (spreadsheet format)

## Developer scripts (`.zscripts/`)
- `dev.sh`: install → `db:push` → dev server → health check → mini-services
- `build.sh`: install → build → mini-services build → tar.gz (hardcodes `/home/z/my-project` as Next.js project dir)
- `start.sh`: prod start → mini-services → Caddy reverse proxy (port 81 → 3000)

## CI
- `.github/workflows/nextjs.yml`: GitHub Pages deploy on push to `main`
- Uses `bun install --frozen-lockfile` and `bun run build`
- Uploads `./out` (SSG default) — note: the `standalone` output config may not match Pages deployment expections

## Production deployment
- Caddy reverse proxy at `:81` forwarding to `localhost:3000`
- Supports `?XTransformPort=` query param for dynamic port proxying
- Auth (next-auth) and i18n (next-intl) deps installed but not integrated

## Patch scripts (root)
`patch.js`, `patch_generator.js`, `patch_model.js` — Node.js scripts with hardcoded find-and-replace on source files. Contain `/home/z/my-project` paths; handle with care.
