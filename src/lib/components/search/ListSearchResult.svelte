<script lang="ts">
import { type NDKEvent, NDKList } from "@nostr-dev-kit/ndk";
import ListSummary from "../lists/ListSummary.svelte";

let { event }: { event: NDKEvent } = $props();

let list = $derived(NDKList.from(event));
</script>

<ListSummary
    title={list.title}
    kind={list.kind}
    date={list.created_at}
    listNip19={list.encode()}
    authorPubkey={list.pubkey}
/>
