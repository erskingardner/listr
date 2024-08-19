<script lang="ts">
    import { NDKList, type NDKEvent } from "@nostr-dev-kit/ndk";
    import ListSummary from "../lists/ListSummary.svelte";

    export let event: NDKEvent;

    const list = NDKList.from(event);
</script>

<ListSummary
    title={list.title}
    kind={list.kind}
    date={list.created_at}
    listNip19={list.encode()}
    authorPubkey={list.pubkey}
/>
