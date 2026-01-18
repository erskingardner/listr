# AGENTS.md

## Project Overview
**Listr** is a Nostr-based list management application built with SvelteKit. It allows users to create, manage, and discover various types of Nostr lists (Contact lists, Mute lists, Bookmarks, Communities, etc.).

## Environment Setup
### Prerequisites
- Node.js (Latest LTS recommended)
- pnpm (Project uses `pnpm-lock.yaml`)

### Installation
```bash
pnpm install
```

### Environment Variables
- The project primarily uses hardcoded relays for NDK in `src/lib/stores/ndk.svelte.ts`.
- Check `.env` for local environment variables if needed.
- Authentication is client-side (NIP-07, NIP-46, or Private Key).

## Commands & Workflows
- **Development**: `pnpm dev` - Starts the local development server.
- **Build**: `pnpm build` - Builds the application for production (using `@sveltejs/adapter-vercel`).
- **Check**: `pnpm check` - Runs `svelte-check` for type checking.
- **Lint**: `pnpm lint` - Runs Prettier check and ESLint.
- **Format**: `pnpm format` - Runs Prettier write.

## Tech Stack
- **Framework**: SvelteKit
- **UI Library**: Svelte 5 (Runes), TailwindCSS, Flowbite Svelte
- **Nostr SDK**: `@nostr-dev-kit/ndk`
- **Icons**: `lucide-svelte`
- **State Management**: Svelte 5 Runes (`.svelte.ts` files)
- **Formatting/Linting**: Biome (config present in `biome.json`) / Prettier & ESLint (scripts in `package.json`)

## Project Structure
- `src/routes/`: Application routes (SvelteKit file-based routing).
- `src/lib/components/`: Reusable UI components.
    - `lists/`: Components specific to list management (actions, items, forms).
    - `users/`: User profile related components.
- `src/lib/stores/`: Global state management.
    - `ndk.svelte.ts`: NDK instance and connection logic.
    - `currentUser.svelte.ts`: Current logged-in user state.
- `src/lib/utils/`: Helper functions.
    - `lists.ts`: Definitions for supported list kinds and validation logic.
    - `nostr.ts`: Nostr specific utilities.
    - `auth.ts`: Authentication logic (NIP-07, NIP-46).

## Nostr Integration Details
- **List Kinds**: Supports a wide range of kinds defined in `src/lib/utils/lists.ts`, including:
    - **Simple Lists (1xxxx)**: `10000` (Mute), `10001` (Pin), `10002` (Relay), `10003` (Bookmarks), `10006` (Communities).
    - **Parameterized Lists (3xxxx)**: `30000` (Follow Sets), `30001` (Categorized Lists/Bookmarks), `30002` (Relay Sets).
- **Authentication**: Supports NIP-07 (Browser Extension), NIP-46 (Bunker), and Private Key login.
- **Relays**:
    - Default explicit relays: `purplepag.es`, `relay.nostr.band`, `relay.snort.social`, `relay.damus.io`, `relay.primal.net`.
    - Outbox relays: `purplepag.es`, `relay.primal.net`.

## Guidelines for AI Agents
- **Code Style**:
    - Use **Svelte 5 Runes** (`$state`, `$derived`, `$effect`) for reactivity.
    - Use TypeScript for all new files.
    - Follow TailwindCSS utility class patterns.
- **Nostr Interactions**:
    - Use the shared NDK instance from `$lib/stores/ndk.svelte.ts`.
    - Ensure all new list types are added to `src/lib/utils/lists.ts`.
    - Handle NIP-19 identifiers (npub, note, naddr) using `nostr-tools` or NDK helpers.
- **Safety**:
    - Do not commit private keys.
    - Be careful when modifying `src/lib/utils/lists.ts` as it controls which lists are supported and how they are displayed.
