import { browser } from '$app/environment';
import { db } from '$lib/interfaces/db';
import { liveQuery, type Observable } from 'dexie';
import ndkStore from '$lib/stores/ndk';
import { get } from 'svelte/store';
import type { NDKEvent, NDKTag } from '@nostr-dev-kit/ndk';
import { truncatedBech } from '$lib/utils/helpers';

interface NoteParams {
    event?: string; // The parsed event as NDKEvent
    id?: string; // either kind:author tuple for replaceable or NIP-33 kind:author:d-tag for PRE
    nip19?: string; // NIP-19 nevent or note encoded id
    authorPubkey: string; // Hex pubkey of the author
    content: string;
    createdAt: number;
    kind: number;
    tags: NDKTag[];
}

/**
 * Note is a formatted and extended version of an NDKEvent for
 * kind 1 notes.
 */

export default class Note {
    event?: string; // The parsed event as NDKEvent
    id?: string; // id value from the event
    nip19?: string; // NIP-19 nevent or note encoded id
    authorPubkey: string; // Hex pubkey of the author
    content: string;
    createdAt: number;
    kind: number;
    tags: NDKTag[];

    constructor(noteParams: NoteParams) {
        this.event = noteParams.event;
        this.id = noteParams.id;
        this.authorPubkey = noteParams.authorPubkey;
        this.content = noteParams.content;
        this.createdAt = noteParams.createdAt;
        this.kind = noteParams.kind;
        this.nip19 = noteParams.nip19;
        this.tags = noteParams.tags;
    }

    static getNotesForUsers(userIds: string[], since?: number): Observable<Note[]> {
        const ndk = get(ndkStore);
        const sinceTime = since ? since : 60 * 60 * 4; // 4 hours

        const notes: Note[] = [];

        ndk.fetchEvents({ kinds: [1], authors: userIds, since: sinceTime }).then(
            (events: Set<NDKEvent>) => {
                events.forEach((event) => {
                    const note = Note.fromNdkEvent(event);
                    db.notes.put(note);
                    notes.push(note);
                });
            }
        );

        return liveQuery(() =>
            browser
                ? db.notes.where('authorPubkey').anyOf(userIds).reverse().sortBy('createdAt')
                : notes
        ) as Observable<Note[]>;
    }

    static get(id: string): Observable<Note> {
        const ndk = get(ndkStore);
        let note: Note;
        ndk.fetchEvent({ ids: [id] }).then((event) => {
            note = Note.fromNdkEvent(event as NDKEvent);
            db.notes.put(note);
        });

        return liveQuery(() =>
            browser ? db.notes.where({ id: id }).first() : note
        ) as Observable<Note>;
    }

    static fromNdkEvent(event: NDKEvent): Note {
        const note = new Note({
            event: JSON.stringify(event.rawEvent()),
            id: event.id,
            nip19: event.encode(),
            authorPubkey: event.pubkey,
            content: event.content,
            createdAt: event.created_at as number,
            kind: event.kind as number,
            tags: event.tags
        });

        return note;
    }

    public truncatedNip19(): string {
        return this.nip19 ? truncatedBech(this.nip19) : '';
    }
}
