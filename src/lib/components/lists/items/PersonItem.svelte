<script lang="ts">
    import { Avatar, Name } from "@nostr-dev-kit/ndk-svelte-components";
    import ndk from "$lib/stores/ndk";
    import { nip19 } from "nostr-tools";

    export let pubkey: string;
</script>

{#key pubkey}
    <a class="flex flex-row gap-2 items-center" href="/p/{nip19.npubEncode(pubkey)}">
        <Avatar ndk={$ndk} {pubkey} class="w-10 h-10 rounded-full" />
        <Name ndk={$ndk} {pubkey} />
    </a>
{/key}
