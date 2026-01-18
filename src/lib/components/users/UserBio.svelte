<script lang="ts">
import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";

let { user, userProfile }: { user: NDKUser; userProfile?: NDKUserProfile } = $props();

let fetchedProfile: NDKUserProfile | null | undefined = $state(undefined);
let profile = $derived(userProfile || user.profile || fetchedProfile);

$effect(() => {
    if (!profile) {
        user.fetchProfile().then((p) => {
            fetchedProfile = p;
        });
    }
});

let bio = $derived(profile?.bio || profile?.about);
</script>

{#if bio}
    <div class="text-sm not-prose leading-relaxed whitespace-normal wrap-break-word">
        {bio}
    </div>
{/if}
