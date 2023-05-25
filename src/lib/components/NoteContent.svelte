<script lang="ts">
    import { parseContent } from '$lib/utils/nip27';
    import ndkStore from '$lib/stores/ndk';
    import { get } from 'svelte/store';
    import { truncatedNpub } from '$lib/interfaces/users';
    export let note: string;
    export let tags: any[];
    export let addNewLines: boolean = true;
    let notePrev: string;

    const links = [];
    const entities = [];
    const ranges = [];

    let anchorId;
    let content: any[];

    async function fetchedUserName(npub: string): Promise<string> {
        const ndk = get(ndkStore);
        const user = ndk.getUser({ npub: npub });
        let name: string;
        return new Promise((resolve, reject) => {
            user.fetchProfile().then(() => {
                name = user.profile?.displayName || user.profile?.name || truncatedNpub(user);
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
</script>

<div>
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
            <img src={value} class="md:w-2/3 my-2" />
        {:else if type.startsWith('nostr:')}
            {#if value.pubkey || value.entity.startsWith('npub')}
                <a href="https://primal.net/profile/{value.entity}">
                    {#await fetchedUserName(value.entity) then name}
                        @{name}
                    {/await}
                </a>
            {:else}
                <div class="embedded-card text-sm">
                    {value.entity}
                </div>
            {/if}
        {:else if type === 'topic'}
            <b>#{value}</b>
        {:else}
            {@html value}
        {/if}
    {/each}
</div>
