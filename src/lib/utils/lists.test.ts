import type { NDKEvent, NDKList, NDKTag } from "@nostr-dev-kit/ndk";
import { NDKKind } from "@nostr-dev-kit/ndk";
import { describe, expect, it } from "vitest";
import {
    BLOCKED_PUBKEYS,
    DUPLICATABLEABLE_LIST_KINDS,
    deduplicateItems,
    ensurePubkeys,
    FEED_LIST_KINDS,
    filterAndSortByTitle,
    filteredItemsForListKind,
    filteredLists,
    ITEM_TYPES_FOR_LIST_KINDS,
    kindIsRelayList,
    LIST_FILTER_REGEXP,
    LIST_MUTE_FILTER_REGEXP,
    LISTR_NPUB,
    placeholderForListKind,
    SUPPORTED_LIST_KINDS,
    UNIQUE_LIST_KINDS,
    validateTagForListKind,
} from "./lists";

describe("lists utility functions", () => {
    describe("deduplicateItems", () => {
        it("should remove duplicate items", () => {
            const items: NDKTag[] = [
                ["p", "pubkey1"],
                ["p", "pubkey1"],
                ["p", "pubkey2"],
            ];
            const result = deduplicateItems(items);
            expect(result).toHaveLength(2);
            expect(result).toEqual([
                ["p", "pubkey1"],
                ["p", "pubkey2"],
            ]);
        });

        it("should return empty array for empty input", () => {
            const result = deduplicateItems([]);
            expect(result).toEqual([]);
        });

        it("should keep items with same tag type but different values", () => {
            const items: NDKTag[] = [
                ["e", "event1"],
                ["e", "event2"],
                ["p", "pubkey1"],
            ];
            const result = deduplicateItems(items);
            expect(result).toHaveLength(3);
        });
    });

    describe("filteredItemsForListKind", () => {
        it("should filter items for FollowSet (kind 30000) to only p tags", () => {
            const items: NDKTag[] = [
                ["p", "pubkey1"],
                ["e", "event1"],
                ["t", "hashtag"],
            ];
            const result = filteredItemsForListKind(items, 30000);
            expect(result).toEqual([["p", "pubkey1"]]);
        });

        it("should return all items for kinds with undefined filter", () => {
            const items: NDKTag[] = [
                ["p", "pubkey1"],
                ["e", "event1"],
                ["word", "something"],
            ];
            // Kind 10000 (MuteList) allows everything
            const result = filteredItemsForListKind(items, 10000);
            expect(result).toEqual(items);
        });

        it("should filter bookmark list items correctly", () => {
            const items: NDKTag[] = [
                ["e", "event1"],
                ["a", "address1"],
                ["t", "hashtag"],
                ["r", "url"],
                ["p", "pubkey1"],
            ];
            // Kind 10003 (BookmarkList) allows e, a, t, r
            const result = filteredItemsForListKind(items, 10003);
            expect(result).toHaveLength(4);
            expect(result.map((i) => i[0])).toEqual(["e", "a", "t", "r"]);
        });
    });

    describe("validateTagForListKind", () => {
        it("should return true for valid tag types", () => {
            expect(validateTagForListKind(["p", "pubkey1"], 30000)).toBe(true);
            expect(validateTagForListKind(["e", "event1"], 10001)).toBe(true);
            expect(validateTagForListKind(["relay", "wss://relay.example.com"], 10006)).toBe(true);
        });

        it("should return false for invalid tag types", () => {
            expect(validateTagForListKind(["e", "event1"], 30000)).toBe(false);
            expect(validateTagForListKind(["p", "pubkey1"], 10001)).toBe(false);
        });

        it("should return true for kinds without restrictions", () => {
            expect(validateTagForListKind(["anything", "value"], 10000)).toBe(true);
        });
    });

    describe("placeholderForListKind", () => {
        it("should return appropriate placeholder for relay lists", () => {
            const placeholder = placeholderForListKind(10002);
            expect(placeholder).toContain("Relay");
            expect(placeholder).toContain("wss://");
        });

        it("should return appropriate placeholder for follow sets", () => {
            const placeholder = placeholderForListKind(30000);
            expect(placeholder).toContain("npub");
        });

        it("should return empty string for unknown kinds", () => {
            expect(placeholderForListKind(99999)).toBe("");
        });
    });

    describe("kindIsRelayList", () => {
        it("should return true for relay list kinds", () => {
            expect(kindIsRelayList(NDKKind.RelayList)).toBe(true);
            expect(kindIsRelayList(NDKKind.BlockRelayList)).toBe(true);
            expect(kindIsRelayList(NDKKind.SearchRelayList)).toBe(true);
            expect(kindIsRelayList(NDKKind.RelaySet)).toBe(true);
            expect(kindIsRelayList(10050)).toBe(true);
            expect(kindIsRelayList(10051)).toBe(true);
        });

        it("should return false for non-relay list kinds", () => {
            expect(kindIsRelayList(NDKKind.Contacts)).toBe(false);
            expect(kindIsRelayList(NDKKind.MuteList)).toBe(false);
            expect(kindIsRelayList(NDKKind.BookmarkList)).toBe(false);
        });
    });

    describe("SUPPORTED_LIST_KINDS", () => {
        it("should include common list kinds", () => {
            expect(SUPPORTED_LIST_KINDS).toContain(NDKKind.Contacts);
            expect(SUPPORTED_LIST_KINDS).toContain(NDKKind.MuteList);
            expect(SUPPORTED_LIST_KINDS).toContain(NDKKind.BookmarkList);
            expect(SUPPORTED_LIST_KINDS).toContain(NDKKind.FollowSet);
        });
    });

    describe("ITEM_TYPES_FOR_LIST_KINDS", () => {
        it("should have correct item types for known kinds", () => {
            expect(ITEM_TYPES_FOR_LIST_KINDS[30000]).toEqual(["p"]);
            expect(ITEM_TYPES_FOR_LIST_KINDS[10001]).toEqual(["e"]);
            expect(ITEM_TYPES_FOR_LIST_KINDS[10002]).toEqual(["r"]);
        });
    });

    describe("ensurePubkeys", () => {
        it("should filter to only valid p tags with valid pubkeys", () => {
            const validPubkey = "a".repeat(64);
            const items: NDKTag[] = [
                ["p", validPubkey],
                ["e", "event1"],
                ["p", "invalid-pubkey"],
            ];
            const result = ensurePubkeys(items);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(["p", validPubkey]);
        });

        it("should return empty array when no valid p tags", () => {
            const items: NDKTag[] = [
                ["e", "event1"],
                ["p", "short"],
                ["t", "hashtag"],
            ];
            const result = ensurePubkeys(items);
            expect(result).toHaveLength(0);
        });

        it("should handle empty array", () => {
            const result = ensurePubkeys([]);
            expect(result).toEqual([]);
        });

        it("should accept uppercase hex pubkeys", () => {
            const upperPubkey = "A".repeat(64);
            const items: NDKTag[] = [["p", upperPubkey]];
            const result = ensurePubkeys(items);
            expect(result).toHaveLength(1);
        });
    });

    describe("filterAndSortByTitle", () => {
        const createMockList = (
            overrides: Partial<{
                id: string;
                title: string;
                pubkey: string;
                kind: number;
                created_at: number;
                tagId: () => string;
            }>
        ): NDKList => {
            const defaults = {
                id: "default-id",
                title: "Default Title",
                pubkey: "a".repeat(64),
                kind: NDKKind.BookmarkList,
                created_at: 1000,
                tagId: () =>
                    `${overrides.kind || NDKKind.BookmarkList}:${overrides.pubkey || "a".repeat(64)}:${overrides.id || "default-id"}`,
            };
            return { ...defaults, ...overrides } as unknown as NDKList;
        };

        it("should filter out blocked pubkeys", () => {
            const lists = [
                createMockList({ id: "1", title: "Good List", pubkey: "b".repeat(64) }),
                createMockList({ id: "2", title: "Blocked List", pubkey: BLOCKED_PUBKEYS[0] }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Good List");
        });

        it("should filter out lists with titles matching LIST_FILTER_REGEXP", () => {
            const lists = [
                createMockList({ id: "1", title: "Good List" }),
                createMockList({ id: "2", title: "chats/general" }),
                createMockList({ id: "3", title: "notifications" }),
                createMockList({ id: "4", title: "/hidden" }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Good List");
        });

        it("should filter out lists without titles", () => {
            const lists = [
                createMockList({ id: "1", title: "Has Title" }),
                createMockList({ id: "2", title: undefined as unknown as string }),
                createMockList({ id: "3", title: "" }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result).toHaveLength(1);
        });

        it("should sort lists alphabetically by title", () => {
            // Use a non-unique kind (FollowSet) so all three are kept
            const lists = [
                createMockList({ id: "1", title: "Zebra", kind: NDKKind.FollowSet }),
                createMockList({ id: "2", title: "Apple", kind: NDKKind.FollowSet }),
                createMockList({ id: "3", title: "Mango", kind: NDKKind.FollowSet }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result.map((l) => l.title)).toEqual(["Apple", "Mango", "Zebra"]);
        });

        it("should keep only the most recent version when duplicate ids exist", () => {
            const lists = [
                createMockList({ id: "same-id", title: "Old Version", created_at: 1000 }),
                createMockList({ id: "same-id", title: "New Version", created_at: 2000 }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("New Version");
        });

        it("should keep earlier version when duplicate has same or older created_at", () => {
            // Test the branch where existing version is kept (current is not newer)
            const lists = [
                createMockList({
                    id: "same-id",
                    title: "First Version",
                    created_at: 2000,
                    kind: NDKKind.FollowSet,
                }),
                createMockList({
                    id: "same-id",
                    title: "Second Version",
                    created_at: 1000,
                    kind: NDKKind.FollowSet,
                }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("First Version");
        });

        it("should keep only the most recent version for unique list kinds", () => {
            const pubkey = "c".repeat(64);
            const lists = [
                createMockList({
                    id: "1",
                    title: "Old Mute List",
                    kind: NDKKind.MuteList,
                    pubkey,
                    created_at: 1000,
                }),
                createMockList({
                    id: "2",
                    title: "New Mute List",
                    kind: NDKKind.MuteList,
                    pubkey,
                    created_at: 2000,
                }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("New Mute List");
        });

        it("should keep earlier unique kind when later has older created_at", () => {
            // Test the branch in filterLatestUniqueKindEvents where existing is kept
            const pubkey = "c".repeat(64);
            const lists = [
                createMockList({
                    id: "1",
                    title: "First Mute List",
                    kind: NDKKind.MuteList,
                    pubkey,
                    created_at: 2000,
                }),
                createMockList({
                    id: "2",
                    title: "Second Mute List",
                    kind: NDKKind.MuteList,
                    pubkey,
                    created_at: 1000,
                }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("First Mute List");
        });

        it("should handle unique list kinds with undefined created_at", () => {
            // Test the nullish coalescing branch in filterLatestUniqueKindEvents
            const pubkey = "c".repeat(64);
            const lists = [
                createMockList({
                    id: "1",
                    title: "Undefined Created At",
                    kind: NDKKind.MuteList,
                    pubkey,
                    created_at: undefined as unknown as number,
                }),
                createMockList({
                    id: "2",
                    title: "Has Created At",
                    kind: NDKKind.MuteList,
                    pubkey,
                    created_at: 1000,
                }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result).toHaveLength(1);
            // The one with created_at should be kept as 1000 > 0 (default for undefined)
            expect(result[0].title).toBe("Has Created At");
        });

        it("should handle duplicate ids where existing has undefined created_at", () => {
            // Test line 106: existing.created_at ?? 0 branch
            const lists = [
                createMockList({
                    id: "same-id",
                    title: "First No Timestamp",
                    kind: NDKKind.FollowSet,
                    created_at: undefined as unknown as number,
                }),
                createMockList({
                    id: "same-id",
                    title: "Second With Timestamp",
                    kind: NDKKind.FollowSet,
                    created_at: 1000,
                }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result).toHaveLength(1);
            // Second should replace first since 1000 > 0
            expect(result[0].title).toBe("Second With Timestamp");
        });

        it("should handle unique kind where latestEventsByKind has undefined created_at", () => {
            // Test line 162: latestEventsByKind[...].created_at ?? 0 branch
            const pubkey = "c".repeat(64);
            const lists = [
                createMockList({
                    id: "1",
                    title: "First No Timestamp",
                    kind: NDKKind.MuteList,
                    pubkey,
                    created_at: undefined as unknown as number,
                }),
                createMockList({
                    id: "2",
                    title: "Second With Timestamp",
                    kind: NDKKind.MuteList,
                    pubkey,
                    created_at: 1,
                }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result).toHaveLength(1);
            // Second should be kept since 1 > 0
            expect(result[0].title).toBe("Second With Timestamp");
        });

        it("should filter out deleted lists when deletions provided", () => {
            const listId = "list-to-delete";
            const listTagId = `${NDKKind.FollowSet}:${"a".repeat(64)}:${listId}`;
            const lists = [
                createMockList({
                    id: listId,
                    title: "Will Be Deleted",
                    kind: NDKKind.FollowSet,
                    tagId: () => listTagId,
                }),
                createMockList({ id: "keep", title: "Keep This", kind: NDKKind.FollowSet }),
            ];
            const deletions = [
                {
                    tagValue: (tag: string) => (tag === "a" ? listTagId : undefined),
                } as unknown as NDKEvent,
            ];
            const result = filterAndSortByTitle(lists, deletions);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Keep This");
        });

        it("should filter out deleted lists by e tag when deletions provided", () => {
            const eventId = "event-to-delete";
            const lists = [
                createMockList({
                    id: eventId,
                    title: "Will Be Deleted",
                    kind: NDKKind.FollowSet,
                    tagId: () => eventId,
                }),
                createMockList({ id: "keep", title: "Keep This", kind: NDKKind.FollowSet }),
            ];
            const deletions = [
                {
                    tagValue: (tag: string) => (tag === "e" ? eventId : undefined),
                } as unknown as NDKEvent,
            ];
            const result = filterAndSortByTitle(lists, deletions);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Keep This");
        });

        it("should handle empty list input", () => {
            const result = filterAndSortByTitle([]);
            expect(result).toEqual([]);
        });

        it("should handle null created_at values", () => {
            // Use non-unique kinds so both are kept
            const lists = [
                createMockList({
                    id: "1",
                    title: "List A",
                    kind: NDKKind.FollowSet,
                    created_at: undefined as unknown as number,
                }),
                createMockList({
                    id: "2",
                    title: "List B",
                    kind: NDKKind.FollowSet,
                    created_at: 1000,
                }),
            ];
            const result = filterAndSortByTitle(lists);
            expect(result).toHaveLength(2);
        });
    });

    describe("filteredLists", () => {
        const createMockList = (
            overrides: Partial<{
                id: string;
                title: string;
                kind: number;
                tagId: () => string;
            }>
        ): NDKList => {
            const defaults = {
                id: "default-id",
                title: "Default Title",
                kind: NDKKind.BookmarkList,
                tagId: () =>
                    `${overrides.kind || NDKKind.BookmarkList}:pubkey:${overrides.id || "default-id"}`,
            };
            return { ...defaults, ...overrides } as unknown as NDKList;
        };

        it("should filter out lists with titles matching LIST_FILTER_REGEXP", () => {
            const lists = [
                createMockList({ id: "1", title: "Good List" }),
                createMockList({ id: "2", title: "chats" }),
                createMockList({ id: "3", title: "/hidden" }),
            ];
            const result = filteredLists(lists);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Good List");
        });

        it("should filter out mute lists when filterMute is true", () => {
            const lists = [
                createMockList({ id: "1", title: "Good List" }),
                createMockList({ id: "2", title: "mute list" }),
                createMockList({ id: "3", title: "My Mute Words" }),
            ];
            const result = filteredLists(lists, undefined, true);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Good List");
        });

        it("should not filter mute lists when filterMute is false", () => {
            const lists = [
                createMockList({ id: "1", title: "Good List" }),
                createMockList({ id: "2", title: "mute list" }),
            ];
            const result = filteredLists(lists, undefined, false);
            expect(result).toHaveLength(2);
        });

        it("should filter out deleted lists when deletions match both a and e tags", () => {
            // The filteredLists function uses || logic: list is kept if
            // a tag doesn't match OR e tag doesn't match
            // So list is deleted only if BOTH match
            const listTagId = "30003:pubkey:list-to-delete";
            const eventId = "list-to-delete";
            const lists = [
                createMockList({
                    id: eventId,
                    title: "Will Be Deleted",
                    tagId: () => listTagId,
                }),
                createMockList({ id: "keep", title: "Keep This" }),
            ];
            const deletions = [
                {
                    tagValue: (tag: string) => {
                        if (tag === "a") return listTagId;
                        if (tag === "e") return eventId;
                        return undefined;
                    },
                } as unknown as NDKEvent,
            ];
            const result = filteredLists(lists, deletions);
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe("Keep This");
        });

        it("should keep lists when only a tag matches but not e tag", () => {
            // Due to || logic, list is kept if either tag doesn't match
            const listTagId = "30003:pubkey:list-to-keep";
            const lists = [
                createMockList({
                    id: "different-event-id",
                    title: "Kept Because E Tag Differs",
                    tagId: () => listTagId,
                }),
                createMockList({ id: "keep", title: "Keep This" }),
            ];
            const deletions = [
                {
                    tagValue: (tag: string) => {
                        if (tag === "a") return listTagId;
                        if (tag === "e") return "some-other-id";
                        return undefined;
                    },
                } as unknown as NDKEvent,
            ];
            const result = filteredLists(lists, deletions);
            // Both lists are kept because e tag doesn't match
            expect(result).toHaveLength(2);
        });

        it("should handle empty list input", () => {
            const result = filteredLists([]);
            expect(result).toEqual([]);
        });

        it("should filter out lists without titles", () => {
            const lists = [
                createMockList({ id: "1", title: "Has Title" }),
                createMockList({ id: "2", title: undefined as unknown as string }),
            ];
            const result = filteredLists(lists);
            expect(result).toHaveLength(1);
        });
    });

    describe("placeholderForListKind - additional cases", () => {
        it("should return placeholder for MuteList (10000)", () => {
            const placeholder = placeholderForListKind(10000);
            expect(placeholder).toContain("NIP-19");
            expect(placeholder).toContain("hashtag");
        });

        it("should return placeholder for PinList (10001)", () => {
            const placeholder = placeholderForListKind(10001);
            expect(placeholder).toContain("Note");
            expect(placeholder).toContain("nevent");
        });

        it("should return same placeholder for all relay list kinds", () => {
            const kinds = [10002, 10006, 10007, 10050, 10051, 30002];
            for (const kind of kinds) {
                const placeholder = placeholderForListKind(kind);
                expect(placeholder).toContain("Relay");
            }
        });

        it("should return placeholder for BookmarkList/BookmarkSet (10003/30003)", () => {
            for (const kind of [10003, 30003]) {
                const placeholder = placeholderForListKind(kind);
                expect(placeholder).toContain("Note");
                expect(placeholder).toContain("hashtag");
            }
        });

        it("should return placeholder for InterestList (10015)", () => {
            const placeholder = placeholderForListKind(10015);
            expect(placeholder).toContain("Interest Set");
            expect(placeholder).toContain("hashtag");
        });

        it("should return placeholder for EmojiList (10030)", () => {
            const placeholder = placeholderForListKind(10030);
            expect(placeholder).toContain("Emoji Set");
            expect(placeholder).toContain("shortcode");
        });

        it("should return placeholder for ArticleCurationSet (30004)", () => {
            const placeholder = placeholderForListKind(30004);
            expect(placeholder).toContain("NIP-19");
        });

        it("should return placeholder for InterestSet (30015)", () => {
            const placeholder = placeholderForListKind(30015);
            expect(placeholder).toContain("Hashtag");
        });

        it("should return placeholder for EmojiSet (30030)", () => {
            const placeholder = placeholderForListKind(30030);
            expect(placeholder).toContain("shortcode");
            expect(placeholder).toContain("emoji");
        });
    });

    describe("constants", () => {
        it("LIST_FILTER_REGEXP should match expected patterns", () => {
            expect(LIST_FILTER_REGEXP.test("chats")).toBe(true);
            expect(LIST_FILTER_REGEXP.test("notifications")).toBe(true);
            expect(LIST_FILTER_REGEXP.test("/hidden")).toBe(true);
            expect(LIST_FILTER_REGEXP.test("normal")).toBe(false);
        });

        it("LIST_MUTE_FILTER_REGEXP should match mute patterns", () => {
            expect(LIST_MUTE_FILTER_REGEXP.test("mute")).toBe(true);
            expect(LIST_MUTE_FILTER_REGEXP.test("Mute")).toBe(true);
            expect(LIST_MUTE_FILTER_REGEXP.test("muted")).toBe(true);
            expect(LIST_MUTE_FILTER_REGEXP.test("normal")).toBe(false);
        });

        it("LISTR_NPUB should be a valid npub", () => {
            expect(LISTR_NPUB).toMatch(/^npub1/);
        });

        it("BLOCKED_PUBKEYS should contain valid pubkeys", () => {
            for (const pubkey of BLOCKED_PUBKEYS) {
                expect(pubkey).toHaveLength(64);
                expect(pubkey).toMatch(/^[0-9a-f]+$/);
            }
        });

        it("FEED_LIST_KINDS should be a subset of or overlap with SUPPORTED_LIST_KINDS", () => {
            // Most feed kinds should be supported
            const supportedSet = new Set(SUPPORTED_LIST_KINDS);
            for (const kind of FEED_LIST_KINDS) {
                expect(supportedSet.has(kind)).toBe(true);
            }
        });

        it("DUPLICATABLEABLE_LIST_KINDS should contain parameterized list kinds", () => {
            // These should all be 30000-range kinds
            for (const kind of DUPLICATABLEABLE_LIST_KINDS) {
                expect(kind).toBeGreaterThanOrEqual(30000);
                expect(kind).toBeLessThan(40000);
            }
        });

        it("UNIQUE_LIST_KINDS should contain replaceable list kinds", () => {
            // These are mostly 10000-range kinds, but also includes NDKKind.Contacts (3)
            expect(UNIQUE_LIST_KINDS).toContain(NDKKind.Contacts);
            expect(UNIQUE_LIST_KINDS).toContain(NDKKind.MuteList);
            expect(UNIQUE_LIST_KINDS).toContain(NDKKind.RelayList);
            // Should not contain parameterized (30000-range) kinds
            for (const kind of UNIQUE_LIST_KINDS) {
                expect(kind).toBeLessThan(30000);
            }
        });
    });
});
