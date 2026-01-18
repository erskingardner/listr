# Listr

A Nostr-based list management application built with SvelteKit. Create, manage, and discover various types of Nostr lists including Contact lists, Mute lists, Bookmarks, Communities, and more.

## Prerequisites

- [Bun](https://bun.sh/)

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Or start and open in browser
bun run dev -- --open
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run check` | Run svelte-check for type checking |
| `bun run lint` | Run Biome linter |
| `bun run format` | Format code with Biome |
| `bun run test` | Run tests in watch mode |
| `bun run test:run` | Run all tests once |

## Tech Stack

- **Framework**: SvelteKit with Svelte 5
- **Styling**: TailwindCSS, Flowbite Svelte
- **Nostr**: @nostr-dev-kit/ndk
- **Testing**: Vitest, @testing-library/svelte
- **Linting/Formatting**: Biome

## Deployment

This project uses `@sveltejs/adapter-vercel` for deployment to Vercel.
