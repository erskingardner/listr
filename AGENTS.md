# AGENTS.md

## Project Overview
**Listr** is a Nostr-based list management application built with SvelteKit. It allows users to create, manage, and discover various types of Nostr lists (Contact lists, Mute lists, Bookmarks, Communities, etc.).

## Environment Setup
### Prerequisites
- [Bun](https://bun.sh/) (Project uses `bun.lockb`)

### Installation
```bash
bun install
```

### Environment Variables
- The project primarily uses hardcoded relays for NDK in `src/lib/stores/ndk.svelte.ts`.
- Check `.env` for local environment variables if needed.
- Authentication is client-side (NIP-07, NIP-46, or Private Key).

## Commands & Workflows
- **Development**: `bun run dev` - Starts the local development server.
- **Build**: `bun run build` - Builds the application for production (using `@sveltejs/adapter-vercel`).
- **Check**: `bun run check` - Runs `svelte-check` for type checking.
- **Lint**: `bun run lint` - Runs Biome check.
- **Format**: `bun run format` - Runs Biome format.
- **Test**: `bun run test` - Runs Vitest in watch mode.
- **Test (CI)**: `bun run test:run` - Runs all tests once.

## Tech Stack
- **Framework**: SvelteKit
- **UI Library**: Svelte 5 (Runes), TailwindCSS, Flowbite Svelte
- **Nostr SDK**: `@nostr-dev-kit/ndk`
- **Icons**: `lucide-svelte`
- **State Management**: Svelte 5 Runes (`.svelte.ts` files)
- **Formatting/Linting**: Biome (config in `biome.json`)
- **Testing**: Vitest with `@testing-library/svelte`

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
    - Default explicit relays: `purplepag.es`, `relay.snort.social`, `relay.damus.io`, `relay.primal.net`.
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

## Code Standards
- Always use TypeScript strict mode
- Never commit without explicitly asking for permission first
- Follow the existing component structure in `src/lib/components`
- Use named exports, not default exports
- Keep functions under 50 lines, break into smaller units if longer

## Testing Requirements
- Run `bun run check` after any changes to verify nothing breaks
- Run `bun run test:run` to run all tests before committing
- Run `bun run dev` and test the app in a browser to verify it works before committing
- Write tests for utility functions in `src/lib/utils/` (use `*.test.ts` naming convention)
- Use Vitest with `@testing-library/svelte` for component tests
- Tests are located alongside source files (e.g., `lists.ts` has `lists.test.ts`)
- Never skip error handling, always wrap risky operations in try/catch

## Git Workflow
- Branch names must follow pattern: `feature/description` or `fix/description`
- Commit messages must be descriptive, not generic ("fix bug" is not acceptable)
- Always run linter before committing: `bun run lint`

## Common Mistakes to Avoid
- Do NOT use `any` type in TypeScript, use proper types or `unknown`
- Do NOT install new dependencies without discussing alternatives first
- Do NOT use inline styles, always use Tailwind classes

## Documentation
- Update README.md if you add new environment variables
- Add JSDoc comments to all exported functions

## Performance Rules
- Lazy load components that aren't immediately visible
- Use `{#key}` blocks or reactive statements efficiently to avoid unnecessary re-renders
- Never fetch data in loops, batch requests instead

## When Stuck
- Search existing closed issues in GitHub before asking
- If adding a workaround, document why with a TODO comment
