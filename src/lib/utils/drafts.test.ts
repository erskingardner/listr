import type { NDKTag } from "@nostr-dev-kit/ndk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearDraft, hasDraft, type ListDraft, loadDraft, saveDraft } from "./drafts";

// Mock $app/environment
vi.mock("$app/environment", () => ({
    browser: true,
}));

describe("drafts utility functions", () => {
    // Mock localStorage
    const mockLocalStorage = (() => {
        let store: Record<string, string> = {};
        return {
            getItem: vi.fn((key: string) => store[key] || null),
            setItem: vi.fn((key: string, value: string) => {
                store[key] = value;
            }),
            removeItem: vi.fn((key: string) => {
                delete store[key];
            }),
            clear: () => {
                store = {};
            },
        };
    })();

    beforeEach(() => {
        mockLocalStorage.clear();
        vi.clearAllMocks();
        Object.defineProperty(globalThis, "localStorage", {
            value: mockLocalStorage,
            writable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("saveDraft", () => {
        it("should save draft to localStorage", () => {
            const listId = "naddr1test123";
            const draft = {
                unsavedPublicItems: [["p", "pubkey1"]] as NDKTag[],
                unsavedPrivateItems: [],
                unsavedPublicRemovals: [],
                unsavedPrivateRemovals: [],
            };

            saveDraft(listId, draft);

            expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
            const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
            expect(savedData.listId).toBe(listId);
            expect(savedData.unsavedPublicItems).toEqual([["p", "pubkey1"]]);
            expect(savedData.savedAt).toBeDefined();
        });

        it("should include all draft fields", () => {
            const listId = "naddr1test456";
            const draft = {
                unsavedPublicItems: [["e", "event1"]] as NDKTag[],
                unsavedPrivateItems: [["p", "private1"]] as NDKTag[],
                unsavedPublicRemovals: [["t", "removed"]] as NDKTag[],
                unsavedPrivateRemovals: [["r", "url"]] as NDKTag[],
                listTitle: "My Draft Title",
                listDescription: "Draft description",
                listImage: "https://example.com/image.png",
                listCategory: "Technology",
            };

            saveDraft(listId, draft);

            const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
            expect(savedData.listTitle).toBe("My Draft Title");
            expect(savedData.listDescription).toBe("Draft description");
            expect(savedData.listImage).toBe("https://example.com/image.png");
            expect(savedData.listCategory).toBe("Technology");
        });

        it("should handle localStorage errors gracefully", () => {
            mockLocalStorage.setItem.mockImplementationOnce(() => {
                throw new Error("QuotaExceededError");
            });

            const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            expect(() => {
                saveDraft("test", {
                    unsavedPublicItems: [],
                    unsavedPrivateItems: [],
                    unsavedPublicRemovals: [],
                    unsavedPrivateRemovals: [],
                });
            }).not.toThrow();

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe("loadDraft", () => {
        it("should load draft from localStorage when listId matches", () => {
            const listId = "naddr1test789";
            const savedDraft: ListDraft = {
                listId,
                unsavedPublicItems: [["p", "pubkey1"]],
                unsavedPrivateItems: [],
                unsavedPublicRemovals: [],
                unsavedPrivateRemovals: [],
                savedAt: Date.now(),
            };
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(savedDraft));

            const result = loadDraft(listId);

            expect(result).not.toBeNull();
            expect(result?.listId).toBe(listId);
            expect(result?.unsavedPublicItems).toEqual([["p", "pubkey1"]]);
        });

        it("should return null when no draft exists", () => {
            mockLocalStorage.getItem.mockReturnValueOnce(null);

            const result = loadDraft("naddr1nonexistent");

            expect(result).toBeNull();
        });

        it("should return null when listId does not match", () => {
            const savedDraft: ListDraft = {
                listId: "naddr1different",
                unsavedPublicItems: [],
                unsavedPrivateItems: [],
                unsavedPublicRemovals: [],
                unsavedPrivateRemovals: [],
                savedAt: Date.now(),
            };
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(savedDraft));

            const result = loadDraft("naddr1expected");

            expect(result).toBeNull();
        });

        it("should return null and clear draft when older than 7 days", () => {
            const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
            const savedDraft: ListDraft = {
                listId: "naddr1expired",
                unsavedPublicItems: [["p", "old"]],
                unsavedPrivateItems: [],
                unsavedPublicRemovals: [],
                unsavedPrivateRemovals: [],
                savedAt: eightDaysAgo,
            };
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(savedDraft));

            const result = loadDraft("naddr1expired");

            expect(result).toBeNull();
            expect(mockLocalStorage.removeItem).toHaveBeenCalled();
        });

        it("should return draft when exactly 7 days old", () => {
            const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000 + 1000; // Just under 7 days
            const savedDraft: ListDraft = {
                listId: "naddr1notexpired",
                unsavedPublicItems: [["p", "recent"]],
                unsavedPrivateItems: [],
                unsavedPublicRemovals: [],
                unsavedPrivateRemovals: [],
                savedAt: sevenDaysAgo,
            };
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(savedDraft));

            const result = loadDraft("naddr1notexpired");

            expect(result).not.toBeNull();
        });

        it("should handle JSON parse errors gracefully", () => {
            mockLocalStorage.getItem.mockReturnValueOnce("invalid json{");

            const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            const result = loadDraft("naddr1test");

            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe("clearDraft", () => {
        it("should remove draft from localStorage", () => {
            clearDraft();

            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("listr-draft");
        });

        it("should handle localStorage errors gracefully", () => {
            mockLocalStorage.removeItem.mockImplementationOnce(() => {
                throw new Error("Storage error");
            });

            const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            expect(() => clearDraft()).not.toThrow();

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe("hasDraft", () => {
        it("should return true when draft has unsaved public items", () => {
            const savedDraft: ListDraft = {
                listId: "naddr1test",
                unsavedPublicItems: [["p", "pubkey1"]],
                unsavedPrivateItems: [],
                unsavedPublicRemovals: [],
                unsavedPrivateRemovals: [],
                savedAt: Date.now(),
            };
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(savedDraft));

            expect(hasDraft("naddr1test")).toBe(true);
        });

        it("should return true when draft has unsaved private items", () => {
            const savedDraft: ListDraft = {
                listId: "naddr1test",
                unsavedPublicItems: [],
                unsavedPrivateItems: [["p", "private1"]],
                unsavedPublicRemovals: [],
                unsavedPrivateRemovals: [],
                savedAt: Date.now(),
            };
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(savedDraft));

            expect(hasDraft("naddr1test")).toBe(true);
        });

        it("should return true when draft has removals", () => {
            const savedDraft: ListDraft = {
                listId: "naddr1test",
                unsavedPublicItems: [],
                unsavedPrivateItems: [],
                unsavedPublicRemovals: [["p", "removed"]],
                unsavedPrivateRemovals: [],
                savedAt: Date.now(),
            };
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(savedDraft));

            expect(hasDraft("naddr1test")).toBe(true);
        });

        it("should return true when draft has metadata changes", () => {
            const savedDraft: ListDraft = {
                listId: "naddr1test",
                unsavedPublicItems: [],
                unsavedPrivateItems: [],
                unsavedPublicRemovals: [],
                unsavedPrivateRemovals: [],
                listTitle: "Changed Title",
                savedAt: Date.now(),
            };
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(savedDraft));

            expect(hasDraft("naddr1test")).toBe(true);
        });

        it("should return false when draft has no changes", () => {
            const savedDraft: ListDraft = {
                listId: "naddr1test",
                unsavedPublicItems: [],
                unsavedPrivateItems: [],
                unsavedPublicRemovals: [],
                unsavedPrivateRemovals: [],
                savedAt: Date.now(),
            };
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(savedDraft));

            expect(hasDraft("naddr1test")).toBe(false);
        });

        it("should return false when no draft exists", () => {
            mockLocalStorage.getItem.mockReturnValueOnce(null);

            expect(hasDraft("naddr1nonexistent")).toBe(false);
        });

        it("should return false when listId does not match", () => {
            const savedDraft: ListDraft = {
                listId: "naddr1different",
                unsavedPublicItems: [["p", "pubkey"]],
                unsavedPrivateItems: [],
                unsavedPublicRemovals: [],
                unsavedPrivateRemovals: [],
                savedAt: Date.now(),
            };
            mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(savedDraft));

            expect(hasDraft("naddr1expected")).toBe(false);
        });
    });
});
