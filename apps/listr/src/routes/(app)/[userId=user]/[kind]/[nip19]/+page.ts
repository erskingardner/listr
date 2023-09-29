import { browser } from "$app/environment";
import currentUser from "$lib/stores/currentUser";
import ndk from "$lib/stores/ndk";
import {
    NDKEvent,
    NDKList,
    NDKNip07Signer,
    type NDKTag,
    type NostrEvent,
} from "@nostr-dev-kit/ndk";
import { get } from "svelte/store";

import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
    const nip19: string = params.nip19;
    const ndkStore = get(ndk);
    const currentUserStore = get(currentUser);
    const event = await ndkStore.fetchEvent(nip19);
    const rawList = event?.rawEvent() as NostrEvent;
    const list = NDKList.from(event as NDKEvent);
    let category: string | undefined;

    try {
        category = list.tags.filter((tag) => tag[0] === "l")[0][1];
    } catch (error) {
        category = undefined;
    }

    let privateItems: NDKTag[] | undefined;

    if (
        browser &&
        !privateItems &&
        list.content.length > 0 &&
        currentUserStore?.hexpubkey === list.pubkey
    ) {
        const signer = new NDKNip07Signer();
        ndkStore.signer = signer;
        privateItems = await list.encryptedTags();
    }

    const itemCount =
        list.items.filter((item) => !["L", "l"].includes(item[0])).length +
        (privateItems?.length || 0);

    return {
        kind: parseInt(params.kind),
        nip19: nip19,
        name: list.name,
        description: list.description,
        category: category,
        rawList,
        listId: list.tagId(),
        items: list.items,
        privateItems,
        itemCount,
    };
};
