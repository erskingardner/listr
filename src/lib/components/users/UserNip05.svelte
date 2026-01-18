<script lang="ts">
import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { BadgeCheck, BadgeHelp, BadgeX } from "lucide-svelte";

let {
    user,
    userProfile,
    nip05MaxLength = 28,
    extraClasses,
}: {
    user: NDKUser;
    userProfile?: NDKUserProfile;
    nip05MaxLength?: number;
    extraClasses?: string;
} = $props();

let fetchedProfile: NDKUserProfile | null | undefined = $state(undefined);
let profile = $derived(userProfile || user.profile || fetchedProfile);
let nip05 = $derived(profile?.nip05);
let truncatedNip05 = $derived(nip05?.slice(0, nip05MaxLength));
let nip05Valid: boolean | null = $state(null);

$effect(() => {
    if (!userProfile && !user.profile) {
        user.fetchProfile().then((profileResponse: NDKUserProfile | null) => {
            fetchedProfile = profileResponse;
        });
    }

    if (user && nip05) {
        user.validateNip05(nip05).then((valid) => {
            nip05Valid = valid;
        });
    }
});
</script>

<div class="{extraClasses}">
    <span>
        {#if nip05Valid === null}
            <BadgeHelp
                size="16"
                strokeWidth="1.5"
                class="fill-gray-200 stroke-gray-600 w-4 h-4"
            />
        {:else if nip05Valid}
            <BadgeCheck
                size="16"
                strokeWidth="1.5"
                class="fill-purple-200 stroke-purple-800"
            />
        {:else}
            <BadgeX
                size="16"
                strokeWidth="1.5"
                class="fill-red-200 stroke-red-800 w-4 h-4"
            />
        {/if}
    </span>

    <span>
        {truncatedNip05}
    </span>
</div>
