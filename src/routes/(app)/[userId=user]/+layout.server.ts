import ndk from "$lib/stores/ndk";
import type { GetUserParams } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import type { ProfilePointer } from "nostr-tools/lib/nip19";
import { get } from "svelte/store";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params }) => {
    const userId = params.userId;
    const ndkUserOpts: GetUserParams = {};
    if (userId.match(/^npub1/)) {
        ndkUserOpts.npub = userId;
    } else if (userId.match(/^nprofile1/)) {
        const profile = nip19.decode(userId);
        ndkUserOpts.hexpubkey = (profile.data as ProfilePointer).pubkey;
    }
    const ndkStore = get(ndk);
    const user = ndkStore.getUser(ndkUserOpts);

    return {
        pubkey: user.hexpubkey(),
    };
};
