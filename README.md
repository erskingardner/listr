# Listr

A Nostr-based list management application built with SvelteKit. Create, manage, and discover various types of Nostr lists including Contact lists, Mute lists, Bookmarks, Communities, and more.

## Prerequisites

- [Node.js](https://nodejs.org/) 24.22.1 or a newer 24.x security release (`.node-version` pins the CI version).
- [Bun](https://bun.sh/) 1.4.4, matching `packageManager` in `package.json` and CI.

## Getting Started

```bash
# Install dependencies
bun install --frozen-lockfile

# Start development server
bun run dev

# Or start and open in browser
bun run dev -- --open
```

## Available Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `bun run dev`      | Start development server           |
| `bun run build`    | Build for production               |
| `bun run preview`  | Preview production build           |
| `bun run check`    | Run svelte-check for type checking |
| `bun run lint`     | Run Biome linter                   |
| `bun run format`   | Format code with Biome             |
| `bun run test`     | Run tests in watch mode            |
| `bun run test:run` | Run all tests once                 |

## Tech Stack

- **Framework**: SvelteKit with Svelte 5
- **Styling**: TailwindCSS, Flowbite Svelte
- **Nostr**: @nostr-dev-kit/ndk
- **Testing**: Vitest, @testing-library/svelte
- **Linting/Formatting**: Biome

## Deployment

This project uses `@sveltejs/adapter-vercel` for deployment to Vercel.
The adapter in `vite.config.ts` targets the managed Node.js 24 runtime. The
`engines.node` range also selects Node.js 24 for Vercel builds. Vercel manages the
runtime patch version; changing this repository does not update an existing deployment.

## Dependency maintenance

Use `bun outdated` to check direct dependencies and `bun update` to refresh
compatible direct and transitive versions. Commit `package.json` and `bun.lock`
together after running `bun run check`, `bun run lint`, `bun run test:run`,
`bun audit`, and `bun run build`. CI runs these checks with the pinned toolchain.
Also run `bun run dev` and check navigation, list rendering, and sign-in in a browser.
- TypeScript remains on the latest 6.x release because SvelteKit 3 and
  `svelte-check` currently declare support for the TypeScript 6 compiler API.
  Revisit the TypeScript 7 upgrade when those tools support it.
- TODO: Remove the `postcss-selector-parser` override when
  `@tailwindcss/typography` stops pinning vulnerable version 6.0.10. Version 7.1.7
  fixes [CVE-2026-104844](https://github.com/advisories/GHSA-rj75-hqrm-r3gf);
  the production build exercises the typography plugin with this override.
