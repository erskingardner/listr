import ndk from "$lib/stores/ndk";
import { NDKList } from "@nostr-dev-kit/ndk";
import { get } from "svelte/store";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    const kind: number = parseInt(params.kind);
    const nip19: string = params.nip19;
    const ndkStore = get(ndk);
    const event = await ndkStore.fetchEvent(nip19);
    const list = NDKList.from(event);
    console.log(list);

    return {
        kind,
        nip19,
        name: list.name,
        items: list.items,
    };
};
