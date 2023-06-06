<script lang="ts">
    import ndk from '$lib/stores/ndk';
    import User from '$lib/classes/user';
    import { parseContent } from '$lib/utils/nip27';
    import { truncatedBech } from '$lib/utils/helpers';
    import type { Observable } from 'dexie';
    import type { NDKUser } from '@nostr-dev-kit/ndk';

    export let note: string;
    export let tags: any[];
    export let addNewLines: boolean = true;
    let notePrev: string;

    const links = [];
    const entities = [];
    const ranges = [];

    let anchorId: any;
    let content: any[];
    let user: Observable<User>;

    function fetchUsername(ndkUser: NDKUser): Promise<string> {
        let name: string;
        return new Promise((resolve, reject) => {
            ndkUser.fetchProfile().then(() => {
                name =
                    ndkUser.profile?.displayName ||
                    ndkUser.profile?.name ||
                    truncatedBech(ndkUser.npub);
                resolve(name);
            });
        });
    }

    $: if (note && note !== notePrev) {
        notePrev = note;

        content = parseContent(note || '', tags);

        // Find links and preceding whitespace
        for (let i = 0; i < content.length; i++) {
            const { type, value } = content[i];

            if (type === 'nostr:npub') {
                user = User.get(value.id);
            }

            if (type === 'nostr:nprofile') {
                user = User.get(value.pubkey);
            }

            if (
                (type === 'link' && !value.startsWith('ws')) ||
                ['nostr:note', 'nostr:nevent'].includes(type)
            ) {
                if (type === 'link') {
                    links.push(value);
                } else if (value.id !== anchorId) {
                    entities.push({ type, value });
                }

                const prev = content[i - 1];
                const next = content[i + 1];

                if ((!prev || prev.type === 'newline') && (!next || next.type === 'newline')) {
                    let n = 1;
                    for (let j = i - 1; ; j--) {
                        if (content[j]?.type === 'newline') {
                            n += 1;
                        } else {
                            break;
                        }
                    }

                    ranges.push({ i: i + 1, n });
                }
            }
        }
    }

    // This is a gross hack to get back a real User object, not a duck-typed pseudo-user.
    let realUser: User;
    $: if ($user) realUser = new User($user);
</script>

<div>
    {#if content}
        {#each content as { type, value }}
            {#if type === 'newline'}
                {#each value as _}
                    {#if addNewLines}
                        <br />
                    {/if}
                {/each}
            {:else if type === 'link'}
                <a href={value} target="_blank">
                    {value.replace(/https?:\/\/(www\.)?/, '')}
                </a>
            {:else if type === 'image'}
                <img src={value} class="md:w-2/3 my-2" alt={value} />
            {:else if type.startsWith('nostr:')}
                {#if value.entity.startsWith('npub')}
                    <a href="https://primal.net/profile/{value.entity}">
                        {#await fetchUsername($ndk.getUser({ npub: value.entity })) then name}
                            @{name}
                        {/await}
                    </a>
                {:else if value.pubkey}
                    <a href="https://primal.net/profile/{value.pubkey}">
                        {#await fetchUsername($ndk.getUser({ hexpubkey: value.pubkey })) then name}
                            @{name}
                        {/await}
                    </a>
                {:else}
                    <div
                        class="embedded-card border border-zinc-800/20 dark:border-zinc-100/20 rounded-sm p-2 mt-2"
                    >
                        <a href="https://primal.net/thread/{value.entity}" target="_blank">
                            {truncatedBech(value.entity, 21)}
                        </a>
                    </div>
                {/if}
            {:else if type === 'topic'}
                <b>#{value}</b>
            {:else}
                {@html value}
            {/if}
        {/each}
    {/if}
</div>
