<!--
	Installed from @ndk/svelte
-->

<script lang="ts">
import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import type { Snippet } from "svelte";
import { setContext } from "svelte";
import { createProfileFetcher } from "../../builders/profile/index.svelte.js";
import { cn } from "../../utils/cn.js";
import { USER_CONTEXT_KEY } from "./user.context.js";

interface Props {
    ndk: NDKSvelte;

    user?: NDKUser;

    npub?: string;

    pubkey?: string;

    profile?: NDKUserProfile;

    onclick?: (e: MouseEvent) => void;

    class?: string;

    children: Snippet;
}

let {
    ndk,
    user,
    pubkey,
    npub,
    profile: propProfile,
    onclick,
    class: className = "",
    children,
}: Props = $props();

// Resolve NDKUser from either user prop or pubkey
const ndkUser = $derived.by(() => {
    if (user) return user;
    if (npub) {
        try {
            return ndk.getUser({ npub });
        } catch {
            return null;
        }
    }
    if (pubkey) {
        try {
            return ndk.getUser({ pubkey });
        } catch {
            return null;
        }
    }
    return null;
});

// Fetch profile if not provided
// Create fetcher outside of $effect to ensure its internal $effect registers properly
const profileFetcher = createProfileFetcher(
    () => (propProfile !== undefined ? { user: null } : { user: ndkUser }),
    ndk
);

const profile = $derived(propProfile !== undefined ? propProfile : profileFetcher?.profile);

// Create reactive context using $state.raw() to preserve reactivity
const context = {
    get ndk() {
        return ndk;
    },
    get user() {
        return user;
    },
    get ndkUser() {
        return ndkUser;
    },
    get profile() {
        return profile;
    },
    get onclick() {
        return onclick;
    },
};

setContext(USER_CONTEXT_KEY, context);
</script>

<div data-user-root="" class={cn("contents", className)}>
  {@render children()}
</div>
