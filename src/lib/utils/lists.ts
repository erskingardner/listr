import type { NDKList } from "@nostr-dev-kit/ndk";

export const LIST_FILTER_REGEXP = /^(chats|notifications)/;

export const filterAndSort = (lists: NDKList[]) => {
    return lists
        .filter((list) => list.name && !list.name.match(LIST_FILTER_REGEXP))
        .sort((a, b) => a.name!.localeCompare(b.name!));
};
