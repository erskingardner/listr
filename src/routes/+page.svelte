<script lang="ts">
    import { currentUser } from '$lib/stores/currentUser';
    import { settings } from '$lib/stores/settings';
    import type { NDKFilter, NDKEvent } from '@nostr-dev-kit/ndk';
    import ndk from '$lib/stores/ndk';

    // let muteListUsers: string[];

    // if ($currentUser) {
    //     const filter: NDKFilter = {
    //         kinds: [10000],
    //         authors: [$currentUser?.hexpubkey()]
    //     };
    //     const subs = $ndk.subscribe(filter, { closeOnEose: true });
    //     subs.on('event', async (event: NDKEvent) => {
    //         const tagValues = event.getMatchingTags('p');
    //         tagValues.forEach((tag) => {
    //             muteListUsers.push(tag[1]);
    //         });
    //     });
    // }
</script>

<p>Current theme: {$settings.theme}</p>
<p>Current user: {$currentUser?.npub || 'None'}</p>
<hr />

<h2>Mute List</h2>
<!-- {#each muteListUsers as userId}
    <p>{userId}</p>
{/each} -->
