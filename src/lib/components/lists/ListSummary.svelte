<script lang="ts">
import ndk from "$lib/stores/ndk.svelte";
import { timeAgo } from "$lib/utils";
import UserDetails from "../users/UserDetails.svelte";

let {
    title,
    kind,
    date,
    listNip19,
    authorPubkey,
}: { title?: string; kind?: number; date?: number; listNip19: string; authorPubkey: string } =
    $props();

const timeInPast = $derived(timeAgo(date as number));
const user = $derived(ndk.getUser({ pubkey: authorPubkey }));
</script>

<div
    class="flex flex-col lg:grid lg:grid-cols-5 gap-2 lg:items-center p-2 border-b border-gray-200 dark:border-gray-700"
>
    <div class="flex lg:hidden text-sm text-gray-400 dark:text-gray-500">{timeInPast}</div>
    <div class="lg:col-span-2">
        <UserDetails {user} />
    </div>
    <div class="lg:col-span-2">
        Updated their <a
            href="/{user.npub}/{kind}/{listNip19}"
            class="font-bold underline hover:no-underline">{title}</a
        > list
    </div>

    <div class="hidden lg:flex text-sm text-gray-400 dark:text-gray-500 ml-auto">{timeInPast}</div>
</div>
