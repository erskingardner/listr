<script lang="ts">
    import { UserPlus2 } from "lucide-svelte";
    import currentUser from "$lib/stores/currentUser";
    import ndk from "$lib/stores/ndk";
    import type { NDKUser } from "@nostr-dev-kit/ndk";

    export let user: NDKUser;

    async function handleFollow() {
        if ($currentUser !== user) {
            console.log("Follow or unfollow");
        }
    }
</script>

<button on:click={handleFollow} class="primaryActionButton">
    <UserPlus2 size="20" strokeWidth="1.5" />
    Follow
</button>
