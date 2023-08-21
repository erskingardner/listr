import { NDKKind, NDKList } from "@nostr-dev-kit/ndk";
import { get } from "svelte/store";

import ndk from "./ndk";

const listsStore = get(ndk).storeSubscribe(
    {
        kinds: [
            NDKKind.PinList as number,
            NDKKind.CategorizedPeopleList as number,
            NDKKind.CategorizedBookmarkList as number,
            NDKKind.RelayList as number,
            NDKKind.Contacts as number,
        ],
        limit: 100,
    },
    { autoStart: false, closeOnEose: false },
    NDKList
);

export default listsStore;
