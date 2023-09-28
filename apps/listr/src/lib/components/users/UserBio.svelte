<script lang="ts">
    import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
    import { onMount } from "svelte";

    export let user: NDKUser | undefined = undefined;
    export let userProfile: NDKUserProfile | undefined = undefined;

    onMount(async () => {
        if (!userProfile) {
            await user?.fetchProfile();
            userProfile = user?.profile;
        }
    });
</script>

{#if userProfile?.bio || userProfile?.about}
    <div class="text-sm not-prose leading-relaxed whitespace-normal break-words">
        {userProfile?.bio || userProfile?.about}
    </div>
{/if}
