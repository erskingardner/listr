import { NDKKind, NDKList } from "@nostr-dev-kit/ndk";
import { get } from "svelte/store";

import ndk from "./ndk";

const listsStore = get(ndk).storeSubscribe(
    {
        kinds: [
            NDKKind.PinList,
            NDKKind.CategorizedPeopleList,
            NDKKind.CategorizedBookmarkList,
            NDKKind.RelayList,
        ],
        limit: 50,
    },
    { autoStart: false },
    NDKList
);

export default listsStore;
