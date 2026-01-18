# Implementation Plan: Follow Packs (Starter Packs - Kind 39089)

## Overview
Implement support for "Starter Packs" (kind 39089), defined in NIP-51 as "a named set of profiles to be shared around with the goal of being followed together". This feature will allow users to create, discover, and "follow all" users in these packs.

## Phase 1: Core Support (Foundation)
### 1.1 Update `src/lib/utils/lists.ts`
- **Add to `SUPPORTED_LIST_KINDS`**: Add `39089` (or `NDKKind.StarterPack` if available, otherwise just number).
- **Add to `FEED_LIST_KINDS`**: To ensure they appear in the main feed.
- **Add to `DUPLICATABLEABLE_LIST_KINDS`**: Users can clone/fork packs.
- **Add to `KIND_FALLBACK_TITLES`**: `39089: "Starter Pack"`.
- **Add to `ITEM_TYPES_FOR_LIST_KINDS`**: `39089: ["p"]` (pubkeys only).
- **Update `placeholderForListKind`**: Return `"NIP-19 pubkey identifier (npub or nprofile)"` for kind 39089.

### 1.2 Update NDK Type Definitions (Optional)
- If `@nostr-dev-kit/ndk` doesn't export `NDKKind.StarterPack`, define a constant locally or use the raw number `39089`.

## Phase 2: Creation & Editing
### 2.1 Update `src/routes/(app)/new/+page.svelte`
- Add option to the "kind" dropdown: `<option value="39089">Starter Pack - kind 39089</option>`.
- Since `ITEM_TYPES_FOR_LIST_KINDS` will enforce `["p"]`, the existing form logic should automatically restrict input to people only.
- Ensure the form supports adding a `title`, `description`, and `image` (cover image), which are standard for sets.

## Phase 3: Display & Interaction
### 3.1 New Component: `FollowPackCard.svelte` (Optional but Recommended)
- Create `src/lib/components/lists/FollowPackCard.svelte`.
- Specialized card that emphasizes the "Pack" nature:
  - Large cover image (if available from `image` tag).
  - Preview of avatars of users inside the pack (overlap style).
  - "Follow All" button directly on the card.
  - User count.

### 3.2 Update `src/routes/(app)/[userId=user]/+page.svelte`
- Add a specific filter/tab for "Starter Packs" if the user has created many.
- Ensure they render correctly in the grid (using `FollowPackCard` or standard `ListCard`).

### 3.3 List Detail View (`src/routes/(app)/[userId=user]/[kind]/[nip19]/+page.svelte`)
- The generic list view should already work.
- Verify `FollowAllButton.svelte` appears and functions correctly for kind 39089.
- Ensure "Cover Image" is displayed prominently if present (check `src/lib/components/lists/ListHeader.svelte` if it exists, or the main page layout).

## Phase 4: Discovery (New Route)
### 4.1 Create `src/routes/(app)/packs/+page.svelte`
- A dedicated page for browsing Starter Packs.
- **Filters**:
  - "Trending" (based on zaps/reposts if possible, or just recent).
  - "My Packs".
  - "Packs from people I follow".
- **Layout**: Grid of `FollowPackCard`.

### 4.2 Navigation
- Add "Starter Packs" to the sidebar navigation (`src/lib/components/sidebar/NavMenu.svelte`).

## Phase 5: Actions
### 5.1 "Follow All" Logic
- Existing `FollowAllButton.svelte` should work out-of-the-box as it handles `p` tags.
- Verify it correctly excludes users you already follow.
- Test with a large pack (e.g., 50+ users) to ensure the `kind: 3` update doesn't hit relay limits (NDK handles this, but good to verify).

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/utils/lists.ts` | Modify | Add kind 39089 definitions and rules. |
| `src/routes/(app)/new/+page.svelte` | Modify | Add Kind 39089 to creation form dropdown. |
| `src/routes/(app)/packs/+page.svelte` | Create | New discovery page for Starter Packs. |
| `src/lib/components/lists/FollowPackCard.svelte` | Create | (Optional) Specialized card for packs. |
| `src/lib/components/sidebar/NavMenu.svelte` | Modify | Add link to `/packs`. |

## Todo List
- [ ] Update `src/lib/utils/lists.ts` with Kind 39089 support
- [ ] Add Kind 39089 option to `src/routes/(app)/new/+page.svelte`
- [ ] Create `src/lib/components/lists/FollowPackCard.svelte`
- [ ] Create `src/routes/(app)/packs/+page.svelte`
- [ ] Add navigation link to `src/lib/components/sidebar/NavMenu.svelte`
- [ ] Verify "Follow All" functionality works for new packs
