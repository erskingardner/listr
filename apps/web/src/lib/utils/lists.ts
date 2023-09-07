import type { NDKEvent, NDKList } from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";

export const SUPPORTED_LIST_KINDS = [
    NDKKind.Contacts,
    NDKKind.MuteList,
    NDKKind.PinList,
    NDKKind.RelayList,
    NDKKind.CategorizedBookmarkList,
    NDKKind.CategorizedPeopleList,
    NDKKind.CategorizedRelayList,
];

export const FORKABLE_LIST_KINDS = [
    NDKKind.CategorizedBookmarkList,
    NDKKind.CategorizedPeopleList,
    NDKKind.CategorizedRelayList,
];

export const LIST_FILTER_REGEXP = /^(chats|notifications|\/)/;

export const filterAndSortByName = (lists: NDKList[], deletions?: NDKEvent[]) => {
    const nameFiltered = lists.filter((list) => list.name && !list.name.match(LIST_FILTER_REGEXP));
    let deleteFiltered;
    if (deletions) {
        deleteFiltered = nameFiltered.filter(
            (list) =>
                !deletions.map((event) => event.tagValue("a")).includes(list.tagId()) ||
                !deletions.map((event) => event.tagValue("e")).includes(list.id)
        );
    }

    const sorted = (deleteFiltered || nameFiltered).sort((a, b) => a.name!.localeCompare(b.name!));
    return sorted;
};

export const filteredLists = (lists: NDKList[], deletions?: NDKEvent[]) => {
    const nameFiltered = lists.filter((list) => list.name && !list.name.match(LIST_FILTER_REGEXP));
    let deleteFiltered;
    if (deletions) {
        deleteFiltered = nameFiltered.filter(
            (list) =>
                !deletions.map((event) => event.tagValue("a")).includes(list.tagId()) ||
                !deletions.map((event) => event.tagValue("e")).includes(list.id)
        );
    }

    return deleteFiltered || nameFiltered;
};
