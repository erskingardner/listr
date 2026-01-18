# NDK v3 Migration Plan

**Created:** 2026-01-18
**Status:** Planning
**Estimated Effort:** 14-18 hours

## Overview

This document outlines the plan to upgrade Listr from NDK v2 to NDK v3, replacing `@nostr-dev-kit/ndk-svelte-components` with `@nostr-dev-kit/svelte`, and adopting the jsrepo component registry for user-related UI components.

### Goals

1. Upgrade to NDK v3 (beta) for latest features and improvements
2. Replace legacy `ndk-svelte-components` with modern `@nostr-dev-kit/svelte`
3. Adopt jsrepo `ui/user` components to replace custom user components
4. Enable the outbox model for better relay discovery
5. Migrate from custom `currentUser` store to built-in `ndk.$sessions`
6. Reduce custom code by leveraging NDK's built-in reactive patterns

### Non-Goals

- Replacing Flowbite Svelte (keeping for Tooltip, Popover, Modal, Tabs, DarkMode)
- Removing nostr-login (keeping for users without browser extensions)
- Enabling Web of Trust (can be added later)

---

## Summary of Decisions

| Area | Current | Target | Notes |
|------|---------|--------|-------|
| NDK Core | `@nostr-dev-kit/ndk@2.18.1` | `@nostr-dev-kit/ndk@3.x-beta` | Major version upgrade |
| Svelte Bindings | None (manual) | `@nostr-dev-kit/svelte@beta` | New reactive subscription API |
| Cache | `@nostr-dev-kit/ndk-cache-dexie@2.6.44` | `@nostr-dev-kit/cache-dexie@beta` | Package renamed |
| Components | `@nostr-dev-kit/ndk-svelte-components@2.3.11` | jsrepo `ui/event-content` | Only uses EventContent |
| User Components | Custom (6 components) | jsrepo `ui/user` | UserAvatar, UserName, etc. |
| User Store | Custom `currentUser.svelte.ts` | `ndk.$sessions` | Built-in session management |
| Flowbite | `flowbite-svelte@1.31.0` | Keep unchanged | Tooltip, Popover, Modal, Tabs, DarkMode |
| nostr-login | `nostr-login@1.7.12` | Keep unchanged | Update integration only |
| Outbox Model | Disabled | Enabled | Better relay discovery |

---

## Current State Analysis

### Package Dependencies

```json
{
  "dependencies": {
    "@nostr-dev-kit/ndk": "2.18.1",
    "@nostr-dev-kit/ndk-cache-dexie": "2.6.44",
    "@nostr-dev-kit/ndk-svelte-components": "^2.3.11"
  }
}
```

### NDK Store (`src/lib/stores/ndk.svelte.ts`)

- Uses `new NDK()` directly
- Manual `$state()` wrapper for reactivity
- Separate `bunkerNDKStore` for NIP-46 (commented out)
- `enableOutboxModel: false`

### Authentication (`src/lib/utils/auth.ts`, `src/lib/stores/currentUser.svelte.ts`)

- Custom `CurrentUser` class with `$state` properties
- Manual session management via cookies
- Supports NIP-07 and nostr-login
- NIP-46 infrastructure exists but is commented out

### Subscription Patterns (7 files)

All subscriptions use manual pattern:
```typescript
let sub: NDKSubscription | null = null;
let events: NDKEvent[] = [];

$effect(() => {
    sub = ndk.subscribe(filter, { closeOnEose: false });
    sub.on("event", (event) => {
        events = [...events, event];
    });
});

onDestroy(() => { sub?.stop(); });
```

Files with subscriptions:
1. `src/routes/(app)/search/+page.svelte`
2. `src/routes/(app)/[userId=user]/+page.svelte`
3. `src/lib/components/sidebar/NavMenu.svelte`
4. `src/lib/components/lists/UserListNav.svelte`
5. `src/lib/components/lists/actions/Like.svelte`
6. `src/lib/components/lists/actions/ZapListButton.svelte`

### Custom User Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `UserAvatar.svelte` | `src/lib/components/users/` | Display user avatar with fallback |
| `UserName.svelte` | `src/lib/components/users/` | Display user name/displayName |
| `UserNip05.svelte` | `src/lib/components/users/` | Display and validate NIP-05 |
| `UserBio.svelte` | `src/lib/components/users/` | Display user bio/about |
| `UserCard.svelte` | `src/lib/components/users/` | Popup card with user details |
| `UserDetails.svelte` | `src/lib/components/users/` | User details row |
| `UserProfileHeader.svelte` | `src/lib/components/users/` | Profile page header |

### ndk-svelte-components Usage

Only one component is used:
- `EventContent` in `src/lib/components/lists/items/EventItem.svelte`

### Flowbite Svelte Usage (23 imports across 15 files)

| Component | Files Using It |
|-----------|----------------|
| `Tooltip` | 11 files |
| `Popover` | 6 files |
| `Modal` | 2 files |
| `Breadcrumb/BreadcrumbItem` | 2 files |
| `Tabs/TabItem` | 1 file |
| `DarkMode` | 2 files |

---

## Target Architecture

### NDK Store (New Pattern)

```typescript
// src/lib/stores/ndk.svelte.ts
import { createNDK } from "@nostr-dev-kit/svelte";
import NDKCacheDexie from "@nostr-dev-kit/cache-dexie";
import { browser } from "$app/environment";

const cacheAdapter = browser
    ? new NDKCacheDexie({ dbName: "listr-v2" })
    : undefined;

export const ndk = createNDK({
    explicitRelayUrls: [
        "wss://purplepag.es",
        "wss://relay.snort.social",
        "wss://relay.damus.io",
        "wss://relay.primal.net",
        "wss://nos.lol",
        "wss://relay.ditto.pub"
    ],
    outboxRelayUrls: ["wss://purplepag.es", "wss://relay.primal.net"],
    enableOutboxModel: true,  // Changed from false
    cacheAdapter,
    clientName: "Listr",
    session: true,  // Enable built-in session management
});

ndk.connect();

export default ndk;
```

### Session Management (New Pattern)

```typescript
// Old pattern
import { getCurrentUser, setCurrentUser } from "$lib/stores/currentUser.svelte";
const user = getCurrentUser()?.user;
const follows = getCurrentUser()?.follows;

// New pattern
import ndk from "$lib/stores/ndk.svelte";
const user = ndk.$currentUser;
const follows = ndk.$follows;

// Login
const signer = new NDKNip07Signer();
await ndk.$sessions.login(signer);

// Logout
ndk.$sessions.logout();

// Follow/unfollow
await ndk.$follows.add(pubkey);
await ndk.$follows.remove(pubkey);
```

### Subscription Pattern (New)

```typescript
// Old pattern
let sub: NDKSubscription | null = null;
let events: NDKEvent[] = [];
$effect(() => {
    sub = ndk.subscribe(filter, { closeOnEose: false });
    sub.on("event", (event) => { events = [...events, event]; });
});
onDestroy(() => { sub?.stop(); });

// New pattern - IMPORTANT: $subscribe takes a CALLBACK function
const sub = ndk.$subscribe(() => ({
    filters: [{ kinds: [1], authors: [pubkey], limit: 50 }],
}));

// In template:
{#each sub.events as event}
    <EventCard {event} />
{/each}

// Properties available:
// sub.events - reactive array of events
// sub.eosed - boolean, EOSE received
// sub.count - number of events
// sub.isEmpty - boolean
```

### User Components (New Pattern with jsrepo)

```svelte
<script>
  import { User } from '$lib/ndk/ui/user';
</script>

<!-- Compound component pattern -->
<User.Root pubkey={user.pubkey}>
  <User.Avatar class="w-12 h-12 rounded-full" />
  <div>
    <User.Name class="font-semibold" />
    <User.Nip05 class="text-sm text-gray-500" />
  </div>
</User.Root>

<!-- Or individual components with context -->
<User.Root {pubkey}>
  <User.Banner class="h-32" />
  <User.Avatar class="w-24 h-24 -mt-12 ml-4" />
  <User.Name field="displayName" />
  <User.Bio />
</User.Root>
```

---

## Implementation Phases

### Phase 1: Setup jsrepo and Add Components
**Estimated: 1 hour**

#### Tasks

1. Install jsrepo CLI globally:
   ```bash
   bun add -g jsrepo
   ```

2. Initialize jsrepo in project:
   ```bash
   jsrepo init @ndk/svelte
   ```
   This creates `jsrepo.json` configuration file.

3. Configure jsrepo paths in `jsrepo.json`:
   ```json
   {
     "$schema": "https://unpkg.com/jsrepo/schemas/project-config.json",
     "repos": ["@ndk/svelte@latest"],
     "paths": {
       "*": "./src/lib/ndk",
       "ui": "./src/lib/ndk/ui",
       "utils": "./src/lib/ndk/utils",
       "builders": "./src/lib/ndk/builders"
     }
   }
   ```

4. Add required components:
   ```bash
   jsrepo add ui/user
   jsrepo add ui/event-content
   jsrepo add builders/event-content
   jsrepo add utils/cn
   jsrepo add utils/ndk
   ```

5. Verify components installed in `src/lib/ndk/`

#### Files Created
- `jsrepo.json` (project root)
- `src/lib/ndk/ui/user/` (user components)
- `src/lib/ndk/ui/event-content.svelte`
- `src/lib/ndk/builders/event-content/`
- `src/lib/ndk/utils/cn.ts`
- `src/lib/ndk/utils/ndk/`

---

### Phase 2: Package Updates
**Estimated: 30 minutes**

#### Tasks

1. Update `package.json` dependencies:

   **Remove:**
   ```json
   "@nostr-dev-kit/ndk": "2.18.1",
   "@nostr-dev-kit/ndk-cache-dexie": "2.6.44",
   "@nostr-dev-kit/ndk-svelte-components": "^2.3.11"
   ```

   **Add:**
   ```json
   "@nostr-dev-kit/ndk": "3.0.0-beta.51",
   "@nostr-dev-kit/svelte": "4.0.0-beta.51",
   "@nostr-dev-kit/cache-dexie": "0.4.0-beta.51"
   ```

2. Run `bun install`

3. Run `bun run check` to identify type errors (expected - will fix in later phases)

#### Files Modified
- `package.json`
- `bun.lockb`

---

### Phase 3: NDK Store Migration
**Estimated: 1 hour**

#### Tasks

1. Rewrite `src/lib/stores/ndk.svelte.ts`:
   - Import `createNDK` from `@nostr-dev-kit/svelte`
   - Import cache adapter from new path
   - Enable `session: true`
   - Enable `enableOutboxModel: true`
   - Remove `$state()` wrapper (NDKSvelte is already reactive)
   - Remove `bunkerNDKStore` (can use main instance for NIP-46)

2. Update import statements throughout codebase if needed

#### Files Modified
- `src/lib/stores/ndk.svelte.ts`

#### Verification
- `bun run check` should pass for ndk.svelte.ts
- `bun run dev` - app should start (may have other errors)

---

### Phase 4: Authentication & Session Migration
**Estimated: 3-4 hours**

#### Tasks

1. **Delete** `src/lib/stores/currentUser.svelte.ts`

2. **Simplify** `src/lib/utils/auth.ts`:
   - Remove `signin()` function (use `ndk.$sessions.login()` directly)
   - Remove `userFromNip07()` (handled by NDK)
   - Keep `signout()` as thin wrapper around `ndk.$sessions.logout()`
   - Keep `SigninMethod` enum for nostr-login integration

3. **Update** files that import from `currentUser.svelte.ts`:

   | File | Changes Needed |
   |------|----------------|
   | `src/routes/(app)/+layout.svelte` | Update auth flow |
   | `src/lib/components/header/Header.svelte` | Use `ndk.$currentUser` |
   | `src/lib/components/sidebar/NavMenu.svelte` | Use `ndk.$currentUser`, `ndk.$follows` |
   | `src/lib/components/lists/actions/FollowButton.svelte` | Use `ndk.$follows.add/remove` |
   | `src/lib/components/lists/UserListNav.svelte` | Use `ndk.$currentUser` |
   | `src/routes/(app)/settings/+page.svelte` | Use `ndk.$currentUser` |
   | `src/routes/(app)/new/+page.svelte` | Use `ndk.$currentUser` |
   | `src/routes/(app)/[userId=user]/+page.svelte` | Use `ndk.$currentUser` |
   | `src/routes/(app)/merge/+page.svelte` | Use `ndk.$currentUser` |

4. **Update** nostr-login integration in `src/routes/(app)/+layout.svelte`:
   ```typescript
   onAuth(npub, options) {
       if (options.type === "logout") {
           ndk.$sessions.logout();
       } else {
           // nostr-login provides the user, need to handle signer
           const user = ndk.getUser({ npub });
           // May need custom handling here
       }
   }
   ```

#### Migration Patterns

| Old | New |
|-----|-----|
| `getCurrentUser()` | `ndk.$currentSession` |
| `getCurrentUser()?.user` | `ndk.$currentUser` |
| `getCurrentUser()?.user?.pubkey` | `ndk.$currentPubkey` |
| `getCurrentUser()?.follows` | `ndk.$follows` (array with add/remove/has) |
| `setCurrentUser(npub)` | `await ndk.$sessions.login(signer)` |
| `currentUser.follow(user)` | `await ndk.$follows.add(pubkey)` |
| `currentUser.unfollow(user)` | `await ndk.$follows.remove(pubkey)` |
| `currentUser.follows.includes(pubkey)` | `ndk.$follows.has(pubkey)` |

#### Files Modified
- `src/lib/utils/auth.ts` (simplify)
- `src/routes/(app)/+layout.svelte`
- `src/lib/components/header/Header.svelte`
- `src/lib/components/sidebar/NavMenu.svelte`
- `src/lib/components/lists/actions/FollowButton.svelte`
- `src/lib/components/lists/UserListNav.svelte`
- `src/routes/(app)/settings/+page.svelte`
- `src/routes/(app)/new/+page.svelte`
- `src/routes/(app)/[userId=user]/+page.svelte`
- `src/routes/(app)/merge/+page.svelte`

#### Files Deleted
- `src/lib/stores/currentUser.svelte.ts`

#### Verification
- `bun run check` should pass
- Login/logout flow works
- Follows are reactive
- Cookie-based session persistence replaced by NDK's localStorage persistence

---

### Phase 5: User Component Replacement
**Estimated: 2-3 hours**

#### Tasks

1. **Identify all usages** of custom user components:
   ```bash
   grep -r "UserAvatar\|UserName\|UserNip05\|UserBio\|UserCard\|UserDetails\|UserProfileHeader" src/
   ```

2. **Update each usage** to use jsrepo `ui/user` components:

   **Before:**
   ```svelte
   <script>
     import UserAvatar from "$lib/components/users/UserAvatar.svelte";
     import UserName from "$lib/components/users/UserName.svelte";
   </script>

   <UserAvatar {user} extraClasses="w-12 h-12" />
   <UserName {user} />
   ```

   **After:**
   ```svelte
   <script>
     import { User } from '$lib/ndk/ui/user';
   </script>

   <User.Root pubkey={user.pubkey}>
     <User.Avatar class="w-12 h-12" />
     <User.Name />
   </User.Root>
   ```

3. **Handle styling differences** - jsrepo components use Tailwind classes directly

4. **Optionally delete** old custom components after all usages migrated

#### Component Mapping

| Old Component | New Component | Notes |
|---------------|---------------|-------|
| `<UserAvatar {user} extraClasses="..." />` | `<User.Avatar class="..." />` | Must be inside `<User.Root>` |
| `<UserName {user} npubMaxLength={9} />` | `<User.Name />` | Truncation handled differently |
| `<UserNip05 {user} />` | `<User.Nip05 />` | |
| `<UserBio {user} />` | `<User.Bio />` | |
| `<UserCard {user} />` | Compose with primitives | See below |
| `<UserDetails {user} />` | Compose with primitives | |
| `<UserProfileHeader {user} />` | Compose with primitives | |

#### UserCard Composition Example

```svelte
<User.Root pubkey={user.pubkey}>
  <div class="flex flex-col gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg">
    <div class="flex items-center gap-3">
      <User.Avatar class="w-12 h-12 rounded-full" />
      <div>
        <User.Name class="font-semibold" />
        <User.Nip05 class="text-sm text-gray-500" />
      </div>
    </div>
    <User.Bio class="text-sm" />
  </div>
</User.Root>
```

#### Files Modified
- All files importing custom user components (~15-20 files)

#### Files Potentially Deleted
- `src/lib/components/users/UserAvatar.svelte`
- `src/lib/components/users/UserName.svelte`
- `src/lib/components/users/UserNip05.svelte`
- `src/lib/components/users/UserBio.svelte`
- `src/lib/components/users/UserCard.svelte`
- `src/lib/components/users/UserDetails.svelte`
- `src/lib/components/users/UserProfileHeader.svelte`

---

### Phase 6: EventContent Replacement
**Estimated: 1 hour**

#### Tasks

1. **Update** `src/lib/components/lists/items/EventItem.svelte`:

   **Before:**
   ```svelte
   <script>
     import { EventContent } from "@nostr-dev-kit/ndk-svelte-components";
   </script>

   <EventContent ndk={ndk as any} event={event as any} />
   ```

   **After:**
   ```svelte
   <script>
     import EventContent from '$lib/ndk/ui/event-content.svelte';
   </script>

   <EventContent {ndk} {event} />
   ```

2. **Configure content renderer** if needed (for custom mention/hashtag/link handling)

#### Files Modified
- `src/lib/components/lists/items/EventItem.svelte`

---

### Phase 7: Subscription Migration
**Estimated: 3-4 hours**

#### Tasks

Update all 7 files with subscriptions to use new `$subscribe()` pattern.

#### File-by-File Changes

**1. `src/routes/(app)/search/+page.svelte`**
```typescript
// Old
const sub = ndk.subscribe({ search: query, limit: 50 }, { relaySet: searchRelays });
sub.on("event", handler);

// New
const sub = ndk.$subscribe(() => ({
    filters: [{ search: query, limit: 50 }],
    relaySet: searchRelays,
}));
// Use sub.events in template
```

**2. `src/routes/(app)/[userId=user]/+page.svelte`**
```typescript
// Old
listsSub = ndk.subscribe({ kinds: [...], authors: [pubkey] }, { closeOnEose: false });
listsSub.on("event", (event) => { lists = [...lists, event]; });

// New
const listsSub = ndk.$subscribe(() => ({
    filters: [{ kinds: SUPPORTED_LIST_KINDS, authors: [pubkey] }],
}));
// Use listsSub.events in template
```

**3. `src/lib/components/sidebar/NavMenu.svelte`**
```typescript
// Similar pattern - current user's lists
const listsSub = ndk.$subscribe(() => 
    ndk.$currentPubkey ? {
        filters: [{ kinds: SUPPORTED_LIST_KINDS, authors: [ndk.$currentPubkey] }],
    } : undefined
);
```

**4. `src/lib/components/lists/UserListNav.svelte`**
```typescript
// User's lists by author prop
const listsSub = ndk.$subscribe(() => ({
    filters: [{ kinds: SUPPORTED_LIST_KINDS, authors: [author] }],
}));
```

**5. `src/lib/components/lists/actions/Like.svelte`**
```typescript
// Reactions for a list
const reactionsSub = ndk.$subscribe(() => ({
    filters: [{ kinds: [NDKKind.Reaction], "#a": [listId] }],
}));
```

**6. `src/lib/components/lists/actions/ZapListButton.svelte`**
```typescript
// Zap receipts for a list
const zapsSub = ndk.$subscribe(() => ({
    filters: [{ kinds: [9735], "#a": [listId] }],
}));
```

#### Key Changes

1. **Remove** manual `$effect` subscription setup
2. **Remove** manual event array management
3. **Remove** `onDestroy` cleanup
4. **Use** callback function pattern: `ndk.$subscribe(() => ({ filters: [...] }))`
5. **Access** `sub.events` directly in templates

#### Files Modified
- `src/routes/(app)/search/+page.svelte`
- `src/routes/(app)/[userId=user]/+page.svelte`
- `src/lib/components/sidebar/NavMenu.svelte`
- `src/lib/components/lists/UserListNav.svelte`
- `src/lib/components/lists/actions/Like.svelte`
- `src/lib/components/lists/actions/ZapListButton.svelte`

---

### Phase 8: nostr-login Integration Update
**Estimated: 1 hour**

#### Tasks

1. **Update** `src/routes/(app)/+layout.svelte` to work with new sessions API

2. **Handle** the case where nostr-login provides authentication:
   - nostr-login may set `window.nostr` dynamically
   - Need to create signer and call `ndk.$sessions.login()`

3. **Test** fallback flow when no browser extension present

#### Considerations

- nostr-login uses its own modal for login
- It may provide the signer via `window.nostr` after auth
- Need to verify session persistence works correctly

#### Files Modified
- `src/routes/(app)/+layout.svelte`
- Possibly `src/lib/utils/auth.ts`

---

### Phase 9: Cleanup & Testing
**Estimated: 2-3 hours**

#### Tasks

1. **Delete** obsolete files:
   - `src/lib/stores/currentUser.svelte.ts` (if not already deleted)
   - `src/lib/external_types/ndk-cache-dexie.d.ts`
   - Old custom user components (after verifying no usages)

2. **Run** type checking:
   ```bash
   bun run check
   ```
   Fix any remaining type errors.

3. **Run** tests:
   ```bash
   bun run test:run
   ```
   Update tests that rely on old patterns.

4. **Manual testing** with `bun run dev`:
   - [ ] Login with NIP-07 extension
   - [ ] Login with nostr-login (no extension)
   - [ ] Logout
   - [ ] Session persistence across page reload
   - [ ] User profile display (avatar, name, nip05)
   - [ ] List subscriptions load
   - [ ] Create new list
   - [ ] Follow/unfollow user
   - [ ] Like/react to list
   - [ ] Zap list
   - [ ] Event content rendering (mentions, hashtags, links)
   - [ ] Search functionality
   - [ ] User profile page

5. **Run** linting:
   ```bash
   bun run lint
   ```

#### Files Deleted
- `src/lib/stores/currentUser.svelte.ts`
- `src/lib/external_types/ndk-cache-dexie.d.ts`
- `src/lib/components/users/UserAvatar.svelte` (optional)
- `src/lib/components/users/UserName.svelte` (optional)
- `src/lib/components/users/UserNip05.svelte` (optional)
- `src/lib/components/users/UserBio.svelte` (optional)
- `src/lib/components/users/UserCard.svelte` (optional)
- `src/lib/components/users/UserDetails.svelte` (optional)
- `src/lib/components/users/UserProfileHeader.svelte` (optional)

---

## Risk Assessment

### High Risk Areas

1. **nostr-login integration** - May require custom handling since nostr-login manages its own auth flow. Need to verify it works with `ndk.$sessions`.

2. **Session persistence** - NDK v3 uses localStorage by default. Verify this works correctly and doesn't conflict with existing cookie-based approach.

3. **Direct Dexie access** - `src/lib/components/lists/actions/Delete.svelte` directly imports `db` from cache-dexie. Need to verify this still works with new package.

### Medium Risk Areas

1. **NDKList API changes** - Verify `NDKList.from()`, `list.items`, `list.encryptedTags()` still work.

2. **Subscription behavior** - New `$subscribe()` may have different timing/ordering of events.

3. **User component styling** - jsrepo components may need custom styling to match current design.

### Low Risk Areas

1. **Flowbite components** - Not touching these, should continue to work.

2. **Core NDK functionality** - `fetchEvents`, `publish`, etc. should be backwards compatible.

---

## Rollback Plan

If critical issues are discovered:

1. **Git revert** - All changes should be in commits that can be reverted

2. **Package rollback** - Can restore old `package.json` dependencies

3. **Feature flag** - Could add environment variable to switch between old/new patterns during migration

---

## Post-Migration Opportunities

After successful migration, consider:

1. **Enable Web of Trust** - `ndk.$wot` for spam filtering

2. **Wallet integration** - `ndk.$wallet` for Cashu/NWC support

3. **More jsrepo components** - Event cards, reaction buttons, zap buttons

4. **Replace Flowbite** - Migrate to bits-ui for consistency with jsrepo components

5. **Negentropy sync** - Use `@nostr-dev-kit/sync` for efficient list synchronization

---

## References

### Documentation

- [NDK v3 README](https://github.com/nostr-dev-kit/ndk/tree/master)
- [@nostr-dev-kit/svelte README](https://github.com/nostr-dev-kit/ndk/tree/master/svelte)
- [jsrepo Registry](https://github.com/nostr-dev-kit/ndk/tree/master/svelte/registry)
- [TENEX Reference Implementation](https://github.com/tenex-chat/web-svelte)

### Key API Differences

| v2 | v3 |
|----|-----|
| `new NDK(config)` | `createNDK(config)` |
| `ndk.subscribe(filter, opts)` | `ndk.$subscribe(() => ({ filters: [filter] }))` |
| Manual session management | `ndk.$sessions.login/logout` |
| `user.follows()` | `ndk.$follows` (reactive array) |
| `NDKCacheAdapterDexie` | `NDKCacheDexie` |
| `@nostr-dev-kit/ndk-cache-dexie` | `@nostr-dev-kit/cache-dexie` |

### Package Versions (Target)

```json
{
  "@nostr-dev-kit/ndk": "3.0.0-beta.51",
  "@nostr-dev-kit/svelte": "4.0.0-beta.51",
  "@nostr-dev-kit/cache-dexie": "0.4.0-beta.51"
}
```
