<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import { Name } from "@nostr-dev-kit/ndk-svelte-components";

    export let name: string;
    export let creator: NDKUser;

    function followLink(event: any) {
        console.log(event.target);
    }
</script>

{#key name}
    <span class="break-all text-sm lg:text-base">
        <span class="font-semibold">{name}</span>
        <span class="italic text-sm">created by</span>
        <a href="/{creator.npub}" class="hover:underline">
            <Name ndk={$ndk} user={creator} />
        </a>
    </span>
{/key}
