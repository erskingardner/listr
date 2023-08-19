import { nip19 } from 'nostr-tools';

function first(list: any) {
    return list ? list[0] : undefined;
}

function last(list: any) {
    return list ? list[list.length - 1] : undefined;
}

export function parseContent(content: string, tags: any[] = []) {
    const result: any[] = [];
    let text = content.trim();
    let buffer = '';

    const parseNewline = () => {
        const newline = first(text.match(/^\n+/));

        if (newline) {
            return ['newline', newline, newline];
        }
    };

    const parseMention = () => {
        // Convert legacy mentions to bech32 entities
        const mentionMatch = text.match(/^#\[(\d+)\]/i);

        if (mentionMatch) {
            const i = parseInt(mentionMatch[1]);

            if (tags[i]) {
                const [tag, value, url] = tags[i];
                const relays: string[] = []; // [url].filter(identity)

                let type, data, entity;
                if (tag === 'p') {
                    type = 'nprofile';
                    data = { pubkey: value, relays };
                    entity = nip19.nprofileEncode(data);
                } else {
                    type = 'nevent';
                    data = { id: value, relays, pubkey: null };
                    entity = nip19.neventEncode(data);
                }

                return [`nostr:${type}`, mentionMatch[0], { ...data, entity }];
            }
        }
    };

    const parseTopic = () => {
        const topic = first(text.match(/^#[\w-]+/i));

        // Skip numeric topics
        if (topic && !topic.match(/^#\d+$/)) {
            return ['topic', topic, topic.slice(1)];
        }
    };

    const parseBech32 = () => {
        const bech32 = first(text.match(/^(nostr:)?n(event|ote|profile|pub)1[\d\w]+/i));

        if (bech32) {
            try {
                const entity = bech32.replace('nostr:', '');
                const { type, data } = nip19.decode(entity) as { type: string; data: object };
                const value = ['note', 'npub'].includes(type) ? { id: data } : data;

                return [`nostr:${type}`, bech32, { ...value, entity }];
            } catch (e) {
                console.log(e);
                // pass
            }
        }
    };

    const parseImg = () => {
        const img = first(text.match(/^(http?s?:?\/\/[^"'\s]*\.(?:png|jpg|jpeg|gif|png|svg))/i));

        if (img) {
            return ['image', img, img];
        }
    };

    const parseUrl = () => {
        const raw = first(
            text.match(
                /^((http|ws)s?:\/\/)?[-a-z0-9:%_\+~#=\.\*]+\.[a-z]{1,6}[-a-z0-9:%_\+~#\?&\/=;\.\*]*/gi
            )
        );

        // Skip url if it's just the end of a filepath
        if (raw) {
            const prev = last(result);

            if (prev?.type === 'text' && prev.value.endsWith('/')) {
                return;
            }

            let url = raw;

            // Skip ellipses and very short non-urls
            if (!url.match(/\.\./) && url.length > 4) {
                // It's common for punctuation to end a url, trim it off
                if (url.match(/[\.\?,:]$/)) {
                    url = url.slice(0, -1);
                }

                if (!url.match('://')) {
                    url = 'https://' + url;
                }

                return ['link', raw, url];
            }
        }
    };

    while (text) {
        const part =
            parseNewline() ||
            parseMention() ||
            parseTopic() ||
            parseBech32() ||
            parseImg() ||
            parseUrl();

        if (part) {
            if (buffer) {
                result.push({ type: 'text', value: buffer });
                buffer = '';
            }

            const [type, raw, value] = part;

            result.push({ type, value });
            text = text.slice(raw.length);
        } else {
            // Instead of going character by character and re-running all the above regular expressions
            // a million times, try to match the next word and add it to the buffer
            const match = first(text.match(/^[\w\d]+ ?/i)) || text[0];

            buffer += match;
            text = text.slice(match.length);
        }
    }

    if (buffer) {
        result.push({ type: 'text', value: buffer });
    }

    return result;
}
