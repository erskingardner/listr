<script lang="ts">
import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";

let {
    user,
    userProfile,
    npubMaxLength = 9,
}: {
    user: NDKUser;
    userProfile?: NDKUserProfile;
    npubMaxLength?: number;
} = $props();

let profile: NDKUserProfile | null | undefined = $state(userProfile || user.profile);

$effect(() => {
    if (!profile) {
        user.fetchProfile().then((profileResponse: NDKUserProfile | null) => {
            profile = profileResponse;
        });
    }
});

let displayName = $derived(
    profile?.displayName || profile?.name || user.npub.slice(0, npubMaxLength)
);
</script>

{displayName}
