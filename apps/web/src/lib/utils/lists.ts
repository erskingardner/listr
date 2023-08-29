import type { NDKEvent, NDKList } from "@nostr-dev-kit/ndk";

export const LIST_FILTER_REGEXP = /^(chats|notifications)/;

export const filterAndSort = (lists: NDKList[], deletions: NDKEvent[]) => {
    console.log(deletions.map((event) => event.tagValue("a")));
    return lists
        .filter((list) => {
            console.log(list.getMatchingTags("d"));
            list.name &&
                !list.name.match(LIST_FILTER_REGEXP) &&
                !deletions.map((event) => event.tagValue("a")).includes(list.tagId());
        })
        .sort((a, b) => a.name!.localeCompare(b.name!));
};
