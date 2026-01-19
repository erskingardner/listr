import type { NDKTag } from "@nostr-dev-kit/ndk";
import { browser } from "$app/environment";

const DRAFT_STORAGE_KEY = "listr-draft";

/**
 * Draft state for list editing, persisted to localStorage.
 */
export interface ListDraft {
    listId: string;
    unsavedPublicItems: NDKTag[];
    unsavedPrivateItems: NDKTag[];
    unsavedPublicRemovals: NDKTag[];
    unsavedPrivateRemovals: NDKTag[];
    listTitle?: string;
    listDescription?: string;
    listImage?: string;
    listCategory?: string;
    savedAt: number;
}

/**
 * Saves draft state to localStorage.
 * @param listId - Unique identifier for the list (e.g., nip19 address)
 * @param draft - Partial draft data to save
 */
export function saveDraft(listId: string, draft: Omit<ListDraft, "listId" | "savedAt">): void {
    if (!browser) return;

    const fullDraft: ListDraft = {
        ...draft,
        listId,
        savedAt: Date.now(),
    };

    try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(fullDraft));
    } catch (e) {
        console.warn("Failed to save draft to localStorage:", e);
    }
}

/**
 * Loads draft state from localStorage if it matches the given list ID.
 * @param listId - Unique identifier for the list
 * @returns The draft if found and matching, null otherwise
 */
export function loadDraft(listId: string): ListDraft | null {
    if (!browser) return null;

    try {
        const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!stored) return null;

        const draft = JSON.parse(stored) as ListDraft;

        // Only return if draft matches this list
        if (draft.listId !== listId) return null;

        // Expire drafts older than 7 days
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - draft.savedAt > sevenDaysMs) {
            clearDraft();
            return null;
        }

        return draft;
    } catch (e) {
        console.warn("Failed to load draft from localStorage:", e);
        return null;
    }
}

/**
 * Clears any saved draft from localStorage.
 */
export function clearDraft(): void {
    if (!browser) return;

    try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
        console.warn("Failed to clear draft from localStorage:", e);
    }
}

/**
 * Checks if there's a draft saved for a specific list.
 * @param listId - Unique identifier for the list
 * @returns true if a draft exists for this list
 */
export function hasDraft(listId: string): boolean {
    const draft = loadDraft(listId);
    return draft !== null && hasChanges(draft);
}

/**
 * Checks if a draft has any actual changes.
 */
function hasChanges(draft: ListDraft): boolean {
    return (
        draft.unsavedPublicItems.length > 0 ||
        draft.unsavedPrivateItems.length > 0 ||
        draft.unsavedPublicRemovals.length > 0 ||
        draft.unsavedPrivateRemovals.length > 0 ||
        draft.listTitle !== undefined ||
        draft.listDescription !== undefined ||
        draft.listImage !== undefined ||
        draft.listCategory !== undefined
    );
}
