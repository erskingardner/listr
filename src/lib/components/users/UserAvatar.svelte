<script lang="ts">
import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { CircleHelp, UserCircle } from "lucide-svelte";

let {
    user,
    userProfile,
    extraClasses,
}: { user: NDKUser; userProfile?: NDKUserProfile; extraClasses: string } = $props();

let fetchedProfile: NDKUserProfile | null | undefined = $state(undefined);
let profile = $derived(userProfile || user.profile || fetchedProfile);

$effect(() => {
    if (!profile) {
        user.fetchProfile().then((p) => {
            fetchedProfile = p;
        });
    }
});
</script>

{#if profile?.image}
    <img src={profile.image as string} alt="Avatar" class="object-cover rounded-full {extraClasses} ring-1 ring-gray-300 dark:ring-gray-500" />
{:else}
    <img src="https://robohash.org/{user.pubkey}" alt="No-Avatar" class="object-cover rounded-full {extraClasses} ring-1 ring-gray-300 dark:ring-gray-500" />
{/if}
