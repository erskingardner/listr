import ndk from "$lib/stores/ndk";
import { get } from "svelte/store";

import type { PageLoad } from "./$types";

export const load: PageLoad = async () => {
    const ids: string[] = [
        "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d", // Fiatjaf
        "1739d937dc8c0c7370aa27585938c119e25c41f6c441a5d34c6d38503e3136ef", // Me
        "d61f3bc5b3eb4400efdae6169a5c17cabf3246b514361de939ce4a1a0da6ef4a", // Miljan
        "bd1e19980e2c91e6dc657e92c25762ca882eb9272d2579e221f037f93788de91", // Vanessa
        "c43bbb58e2e6bc2f9455758257f6ba5329107bd4e8274068c2936c69d9980b7d", // Roya
        "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245", // JB55
        "92de68b21302fa2137b1cbba7259b8ba967b535a05c6d2b0847d9f35ff3cf56a", // SusieBdds
        "bf2376e17ba4ec269d10fcc996a4746b451152be9031fa48e74553dde5526bce", // Carla
        "c48e29f04b482cc01ca1f9ef8c86ef8318c059e0e9353235162f080f26e14c11", // Walker
        "460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c", // Vitor
        "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93", // Gigi
        "7fa56f5d6962ab1e3cd424e758c3002b8665f7b0d8dcee9fe9e288d7751ac194", // verbiricha
        "cc8d072efdcc676fcbac14f6cd6825edc3576e55eb786a2a975ee034a6a026cb", // Sherry
        "efa6abd09142caf23dfb70ed3b9bd549042901caa66f686259a1cc55a4970369", // Elidy
        "26bd32c67232bdf16d05e763ec67d883015eb99fd1269025224c20c6cfdb0158", // Marce
    ];

    const ndkStore = get(ndk);
    const shuffled = ids.sort(() => 0.5 - Math.random()).slice(0, 9);
    const users = shuffled.map((id) => ndkStore.getUser({ pubkey: id }));

    return {
        users,
    };
};
