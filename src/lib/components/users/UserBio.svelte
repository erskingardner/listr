<script lang="ts">
import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";

let { user, userProfile }: { user: NDKUser; userProfile?: NDKUserProfile } = $props();

let profile: NDKUserProfile | null | undefined = $state(userProfile || user.profile);

$effect(() => {
    if (!profile) {
        user.fetchProfile().then((userProfile) => {
            profile = userProfile;
        });
    }
});

let bio = $derived(profile?.bio || profile?.about);
</script>

{#if bio}
    <div class="text-sm not-prose leading-relaxed whitespace-normal break-words">
        {bio}
    </div>
{/if}
