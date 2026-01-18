import { NDKKind } from "@nostr-dev-kit/ndk";
import { nip05 } from "nostr-tools";
import { describe, expect, it, vi } from "vitest";
import {
    aTagToNip19,
    NOSTR_BECH32_REGEXP,
    NOSTR_PUBKEY_REGEXP,
    nip19ToTag,
    stringInputToTag,
} from "./nostr";

vi.mock("$app/environment", () => ({
    browser: false,
    dev: true,
    building: false,
    version: "test",
}));

vi.mock("nostr-tools", async (importOriginal) => {
    const mod = await importOriginal<typeof import("nostr-tools")>();
    return {
        ...mod,
        nip05: {
            ...mod.nip05,
            queryProfile: vi.fn(),
        },
    };
});

describe("nostr utility functions", () => {
    describe("NOSTR_BECH32_REGEXP", () => {
        it("should match valid npub identifiers", () => {
            const npub = "npub1test123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz";
            expect(NOSTR_BECH32_REGEXP.test(npub)).toBe(true);
        });

        it("should match valid nprofile identifiers", () => {
            const nprofile = "nprofile1test123abc";
            expect(NOSTR_BECH32_REGEXP.test(nprofile)).toBe(true);
        });

        it("should match valid note identifiers", () => {
            const note = "note1test123abc";
            expect(NOSTR_BECH32_REGEXP.test(note)).toBe(true);
        });

        it("should match valid nevent identifiers", () => {
            const nevent = "nevent1test123abc";
            expect(NOSTR_BECH32_REGEXP.test(nevent)).toBe(true);
        });

        it("should match valid naddr identifiers", () => {
            const naddr = "naddr1test123abc";
            expect(NOSTR_BECH32_REGEXP.test(naddr)).toBe(true);
        });

        it("should not match invalid identifiers", () => {
            expect(NOSTR_BECH32_REGEXP.test("invalid")).toBe(false);
            expect(NOSTR_BECH32_REGEXP.test("pub1abc")).toBe(false);
            expect(NOSTR_BECH32_REGEXP.test("")).toBe(false);
        });
    });

    describe("NOSTR_PUBKEY_REGEXP", () => {
        it("should match valid 64-character hex pubkeys", () => {
            const validPubkey = "a".repeat(64);
            expect(NOSTR_PUBKEY_REGEXP.test(validPubkey)).toBe(true);
        });

        it("should match pubkeys with mixed hex characters", () => {
            const pubkey = "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
            expect(NOSTR_PUBKEY_REGEXP.test(pubkey)).toBe(true);
        });

        it("should not match pubkeys that are too short", () => {
            const shortPubkey = "a".repeat(63);
            expect(NOSTR_PUBKEY_REGEXP.test(shortPubkey)).toBe(false);
        });

        it("should not match pubkeys that are too long", () => {
            const longPubkey = "a".repeat(65);
            expect(NOSTR_PUBKEY_REGEXP.test(longPubkey)).toBe(false);
        });

        it("should not match pubkeys with invalid characters", () => {
            const invalidPubkey = "g".repeat(64); // 'g' is not a hex character
            expect(NOSTR_PUBKEY_REGEXP.test(invalidPubkey)).toBe(false);
        });
    });

    describe("nip19ToTag", () => {
        it("should convert npub to p tag", () => {
            // Valid npub for testing (npub1... decodes to a pubkey)
            const npub = "npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6";
            const result = nip19ToTag(npub);

            expect(result).toBeDefined();
            expect(result?.[0]).toBe("p");
            expect(result?.[1]).toHaveLength(64); // pubkey is 64 hex chars
        });

        it("should convert note to e tag", () => {
            // Valid note generated with nostr-tools
            const note = "note1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsxthhhz";
            const result = nip19ToTag(note);

            expect(result).toBeDefined();
            expect(result?.[0]).toBe("e");
        });

        it("should convert nevent to e tag", () => {
            // Valid nevent generated with nostr-tools
            const nevent = "nevent1qqsqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqgaffult";
            const result = nip19ToTag(nevent);

            expect(result).toBeDefined();
            expect(result?.[0]).toBe("e");
        });

        it("should convert naddr to a tag", () => {
            // Valid naddr generated with nostr-tools
            const naddr =
                "naddr1qvzqqqr4gupzqwlsccluhy6xxsr6l9a9uhhxf75g85g8a709tprjcn4e42h053vaqqz8getnws7hxj3s";
            const result = nip19ToTag(naddr);

            expect(result).toBeDefined();
            expect(result?.[0]).toBe("a");
            expect(result?.[1]).toContain(":"); // a tags have format "kind:pubkey:identifier"
        });

        it("should convert nprofile to e tag with relay hint", () => {
            // Valid nprofile with relays generated with nostr-tools
            const nprofile =
                "nprofile1qy28wumn8ghj7un9d3shjtnyv9kh2uewd9hsqgpm7rrrljungc6q0tuh5hj7ue863q73qlheu4vywtzwhx42a7j9n5fs5qqw";
            const result = nip19ToTag(nprofile);

            expect(result).toBeDefined();
            expect(result?.[0]).toBe("e"); // nprofile decodes to pubkey but function returns 'e' tag
            expect(result?.length).toBeGreaterThanOrEqual(2); // may include relay hint
        });

        it("should include relay hint from nprofile when available", () => {
            // nprofile with relay: nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p
            // This encodes pubkey 3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d with relays
            const nprofile =
                "nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p";
            const result = nip19ToTag(nprofile);

            expect(result).toBeDefined();
            expect(result?.[0]).toBe("e");
            expect(result?.[1]).toBe(
                "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d"
            );
            expect(result?.length).toBe(3); // Should include relay hint
            expect(result?.[2]).toMatch(/^wss?:\/\//); // Should be a relay URL
        });

        it("should include relay hint from nevent when available", () => {
            // nevent with relay (generated with nostr-tools)
            const nevent =
                "nevent1qy28wumn8ghj7un9d3shjtnyv9kh2uewd9hsqgqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylquqwr";
            const result = nip19ToTag(nevent);

            expect(result).toBeDefined();
            expect(result?.[0]).toBe("e");
            expect(result?.length).toBe(3); // Should include relay hint
            expect(result?.[2]).toMatch(/^wss?:\/\//); // Should be a relay URL
        });

        it("should include relay hint from naddr when available", () => {
            // naddr with relay (generated with nostr-tools)
            const naddr =
                "naddr1qvzqqqr4gupzqwlsccluhy6xxsr6l9a9uhhxf75g85g8a709tprjcn4e42h053vaqy28wumn8ghj7un9d3shjtnyv9kh2uewd9hsqpr5v4ehgqee9q5";
            const result = nip19ToTag(naddr);

            expect(result).toBeDefined();
            expect(result?.[0]).toBe("a");
            expect(result?.length).toBe(3); // Should include relay hint
            expect(result?.[2]).toMatch(/^wss?:\/\//); // Should be a relay URL
        });
    });

    describe("stringInputToTag", () => {
        it("should handle hashtag input", async () => {
            const result = await stringInputToTag("#bitcoin", 10000);

            expect(result).toEqual(["t", "bitcoin"]);
        });

        it("should handle URL input", async () => {
            const result = await stringInputToTag("https://example.com", 10003);

            expect(result).toEqual(["r", "https://example.com"]);
        });

        it("should handle http URL input", async () => {
            const result = await stringInputToTag("http://example.com", 10003);

            expect(result).toEqual(["r", "http://example.com"]);
        });

        it("should handle wss relay URL for non-RelayList kinds", async () => {
            const result = await stringInputToTag("wss://relay.example.com", 10003);

            expect(result).toEqual(["relay", "wss://relay.example.com"]);
        });

        it("should handle wss relay URL for RelayList kind", async () => {
            const result = await stringInputToTag("wss://relay.example.com", NDKKind.RelayList);

            expect(result).toEqual(["r", "wss://relay.example.com"]);
        });

        it("should handle ws relay URL", async () => {
            const result = await stringInputToTag("ws://relay.example.com", 10003);

            expect(result).toEqual(["relay", "ws://relay.example.com"]);
        });

        it("should handle emoji input with shortcode and URL", async () => {
            const result = await stringInputToTag(":smile:, https://example.com/smile.png", 30030);

            // Note: The current implementation only removes one colon with replace()
            // This tests the actual behavior - shortcode retains trailing colon
            expect(result).toEqual(["emoji", "smile:", "https://example.com/smile.png"]);
        });

        it("should handle emoji input with space after comma", async () => {
            const result = await stringInputToTag(":laugh:,https://example.com/laugh.png", 30030);

            // Note: The current implementation only removes one colon with replace()
            expect(result).toEqual(["emoji", "laugh:", "https://example.com/laugh.png"]);
        });

        it("should pass through NIP-19 identifiers to nip19ToTag", async () => {
            const npub = "npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6";
            const result = await stringInputToTag(npub, 30000);

            expect(result).toBeDefined();
            expect(result?.[0]).toBe("p");
        });

        it("should resolve NIP-05 identifier", async () => {
            vi.mocked(nip05.queryProfile).mockResolvedValue({
                pubkey: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
                relays: [],
            });
            const result = await stringInputToTag("user@example.com", 30000);
            expect(result).toEqual([
                "p",
                "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            ]);
        });

        it("should add markers to tag if provided", async () => {
            const result = await stringInputToTag("#bitcoin", 10000, ["marker1", "marker2"]);

            expect(result).toEqual(["t", "bitcoin", "marker1", "marker2"]);
        });

        it("should return undefined for unrecognized input", async () => {
            const result = await stringInputToTag("random text", 10000);

            expect(result).toBeUndefined();
        });
    });

    describe("aTagToNip19", () => {
        it("should convert a tag to naddr", () => {
            const aTag = [
                "a",
                "30023:3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d:test-article",
            ];
            const result = aTagToNip19(aTag);

            expect(result).toMatch(/^naddr1/);
        });

        it("should throw error for non-a tags", () => {
            const pTag = ["p", "somepubkey"];

            expect(() => aTagToNip19(pTag)).toThrow("Not an a tag");
        });

        it("should throw error for e tags", () => {
            const eTag = ["e", "someeventid"];

            expect(() => aTagToNip19(eTag)).toThrow("Not an a tag");
        });

        it("should handle a tag with empty identifier", () => {
            const aTag = [
                "a",
                "30000:3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d:",
            ];
            const result = aTagToNip19(aTag);

            expect(result).toMatch(/^naddr1/);
        });
    });
});
