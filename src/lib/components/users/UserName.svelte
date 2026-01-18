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

let fetchedProfile: NDKUserProfile | null | undefined = $state(undefined);
let profile = $derived(userProfile || user.profile || fetchedProfile);

$effect(() => {
    if (!profile) {
        user.fetchProfile().then((profileResponse: NDKUserProfile | null) => {
            fetchedProfile = profileResponse;
        });
    }
});

let displayName = $derived(
    profile?.displayName || profile?.name || user.npub.slice(0, npubMaxLength)
);
</script>

{displayName}
