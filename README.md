# Real Estate CRM Frontend (`real-estate-frontend`)

A modern, responsive frontend for the Single-Tenant Real Estate CRM application featuring a bi-directional lead–property matching engine. Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## 🏛 Architecture & Standalone Repository

This frontend is a **standalone git repository** that lives alongside the sibling backend repository (`real-estate-backend`) under a common root folder.

- **No Shared Code / Not a Monorepo**: Frontend and backend do not share code directly or share a `package.json`.
- **Communication Protocol**: All interactions occur over a versioned HTTP REST API via a configurable base URL (`NEXT_PUBLIC_API_URL`).
- **Single-Tenant**: Designed specifically for a single real estate organization (Admin + Agent team). No `organizationId` or multi-tenant scaffolding.
- **Strict Light Theme**: All UI layouts adhere to a clean light-theme palette (`#F8FAFC` background, `#1E293B` text, `#2563EB` primary).

---

## 📁 Directory Structure

```text
real-estate-frontend/
├── public/                     # Static assets & icons
├── src/
│   ├── app/                    # Next.js App Router pages & layouts
│   │   ├── globals.css         # Strict light theme design tokens & Tailwind imports
│   │   ├── layout.tsx          # Root shell layout with Navbar & Sidebar
│   │   ├── page.tsx            # Dashboard overview page
│   │   ├── leads/              # Lead management views (/leads)
│   │   │   └── page.tsx
│   │   ├── properties/         # Property listings views (/properties)
│   │   │   └── page.tsx
│   │   ├── matches/            # Matching engine score feed (/matches)
│   │   │   └── page.tsx
│   │   └── pipeline/           # Kanban pipeline stage view (/pipeline)
│   │       └── page.tsx
│   ├── components/             # Reusable UI component library
│   │   ├── layout/             # Layout components (Navbar, Sidebar)
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                 # Core reusable UI primitives
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── DataTable.tsx
│   │       ├── Input.tsx
│   │       ├── MatchScoreBadge.tsx # Standardized match score color logic
│   │       └── StatusPill.tsx  # Status indicators for leads/properties
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Auth state & JWT session management
│   │   ├── useFetch.ts         # Generic REST API data fetching hook
│   │   └── useMatches.ts       # Matching engine data & status updater hook
│   ├── lib/                    # Shared libraries & utilities
│   │   ├── utils.ts            # Utility helpers (cn, formatCurrency, formatDate)
│   │   └── api-client/         # HTTP API client for backend communication
│   │       ├── endpoints.ts    # Centralized REST API endpoints map
│   │       └── index.ts        # Type-safe fetch wrapper with JWT header injection
│   └── types/                  # TypeScript domain entity & API types
│       └── index.ts            # Lead, Property, Match, Interaction, User types
├── .env.example                # Example environment variables template
├── .prettierrc                 # Prettier configuration with Tailwind plugin
├── .prettierignore             # Prettier ignore rules
├── eslint.config.mjs           # Next.js ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies & scripts
├── postcss.config.mjs          # PostCSS configuration for Tailwind CSS
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

---

## ⚙️ Environment Configuration

The frontend talks to the backend via `NEXT_PUBLIC_API_URL`.

Create a local environment file by copying `.env.example`:

```bash
cp .env.example .env.local
```

### Environment Variables

| Variable              | Description                      | Default                        |
| :-------------------- | :------------------------------- | :----------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend REST API | `http://localhost:3001/api/v1` |

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000).

### 3. Tooling Scripts

- **Type Check & Lint**:
  ```bash
  npm run lint
  ```
- **Format Code**:
  ```bash
  npm run format
  ```
- **Format Verification**:
  ```bash
  npm run format:check
  ```
- **Production Build**:
  ```bash
  npm run build
  ```

---

## 🎨 UI & Design Rules

- **Theme**: Light theme only.
- **Color Palette**:
  - Primary: `#2563EB` (Blue)
  - Success / High Match: `#16A34A` (Green)
  - Warning / Moderate Match: `#F59E0B` (Amber)
  - Danger / Low Match: `#DC2626` (Red)
  - Background: `#F8FAFC` (Slate 50)
  - Text Primary: `#1E293B` (Slate 800)
- **Match Score Badges**:
  - `> 80%`: Green badge
  - `50% – 80%`: Amber badge
  - `< 50%`: Gray / Slate badge
