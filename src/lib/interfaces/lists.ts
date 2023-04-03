// import type { NDKFilter, NDKEvent } from '@nostr-dev-kit/ndk';
// import { get as getStore } from 'svelte/store';
// import ndkStore from '$lib/stores/ndk';

// const ListInterface = {
//     muteListForUser: (userId: string) => {
//         // 10000: Mute list
//         const filter: NDKFilter = { kinds: [10000] };
//         if (userId) filter.authors = [userId];

//         const ndk = getStore(ndkStore);
//         const subs = ndk.subscribe(filter, { closeOnEose: true });
//         console.log(subs);
//         let muteList: string[];
//         subs.on('event', async (event: NDKEvent) => {
//             const tagValues = event.getMatchingTags('p');
//             tagValues.forEach((tag) => {
//                 muteList.push(tag[1]);
//             });
//             return muteList;
//         });
//     }
// };

// export default ListInterface;
