<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import { timeAgo } from "$lib/utils";
    import UserDetails from "../users/UserDetails.svelte";

    export let name: string | undefined;
    export let kind: number | undefined;
    export let date: number | undefined;
    export let listNip19: string;
    export let authorPubkey: string;

    const timeInPast = timeAgo(date as number);
    const user = $ndk.getUser({ hexpubkey: authorPubkey });
</script>

<div class="grid grid-cols-5 gap-2 items-center p-2 border-b border-gray-200">
    <div class="col-span-2">
        <UserDetails {user} />
    </div>
    <div class="col-span-2">
        updated their <a href="/{user.npub}/{kind}/{listNip19}" class="font-medium hover:underline"
            >{name}</a
        > list
    </div>
    <div class="text-sm ml-auto">{timeInPast}</div>
</div>
