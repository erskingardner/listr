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
    <p class="break-words">{userProfile?.bio || userProfile?.about}</p>
{/if}
