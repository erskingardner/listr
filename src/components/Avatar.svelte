<script lang="ts">
    import type { Profile } from '$lib/types/Profile';
    import { Author, RelayPool } from 'nostr-relaypool';
    import { relays } from '$lib/const';

    export let pubKey: string | undefined = undefined;
    export let profileMetadata: Profile | undefined = undefined;

    // If we don't have the data we need, throw.
    if (!profileMetadata && !pubKey) {
        throw new Error('Either pubKey or profileMetadata parameter are required.');
    }

    // If we don't have profileMetadata but we do have a pubkey
    if (!profileMetadata && !!pubKey) {
        let relayPool = new RelayPool();
        const author = new Author(relayPool, relays, pubKey);
        if (author !== undefined) {
            author.metaData((e) => {
                let profileJson = JSON.parse(e.content);
                profileMetadata = {
                    pubKey: pubKey as string,
                    picture: profileJson.picture,
                    display_name: profileJson.display_name
                };
                relayPool.close();
            }, 0);
        }
    }
</script>

<div class="avatar">
    <img
        src={profileMetadata?.picture}
        alt="Avatar for {profileMetadata?.display_name}"
        class="w-12 h-12 rounded-full border-4 border-stone-200 hover:border-stone-300 dark:border-stone-800 hover:dark:border-stone-700"
    />
</div>
