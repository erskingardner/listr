import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { capitalize, copyToClipboard } from "./index";

describe("index utility functions", () => {
    describe("copyToClipboard", () => {
        let originalClipboard: Clipboard | undefined;

        beforeEach(() => {
            // Save original clipboard
            originalClipboard = navigator.clipboard;
            // Mock navigator.clipboard
            Object.defineProperty(navigator, "clipboard", {
                value: {
                    writeText: vi.fn().mockResolvedValue(undefined),
                },
                writable: true,
                configurable: true,
            });
        });

        afterEach(() => {
            // Restore original clipboard
            if (originalClipboard) {
                Object.defineProperty(navigator, "clipboard", {
                    value: originalClipboard,
                    writable: true,
                    configurable: true,
                });
            }
            vi.restoreAllMocks();
        });

        it("should copy text to clipboard successfully", async () => {
            await copyToClipboard("test text");
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test text");
        });

        it("should handle empty string", async () => {
            await copyToClipboard("");
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("");
        });

        it("should handle clipboard errors gracefully", async () => {
            const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
                new Error("Clipboard error")
            );

            await copyToClipboard("test");

            expect(consoleSpy).toHaveBeenCalledWith("Failed to copy: ", expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe("capitalize", () => {
        it("should capitalize the first letter of a lowercase word", () => {
            expect(capitalize("hello")).toBe("Hello");
        });

        it("should keep already capitalized words unchanged", () => {
            expect(capitalize("Hello")).toBe("Hello");
        });

        it("should handle single character strings", () => {
            expect(capitalize("a")).toBe("A");
            expect(capitalize("A")).toBe("A");
        });

        it("should handle empty strings", () => {
            expect(capitalize("")).toBe("");
        });

        it("should only capitalize the first letter, leaving the rest unchanged", () => {
            expect(capitalize("hELLO")).toBe("HELLO");
            expect(capitalize("hello world")).toBe("Hello world");
        });

        it("should handle strings starting with numbers", () => {
            expect(capitalize("123abc")).toBe("123abc");
        });

        it("should handle strings starting with special characters", () => {
            expect(capitalize("!hello")).toBe("!hello");
            expect(capitalize("@test")).toBe("@test");
        });

        it("should handle strings with unicode characters", () => {
            expect(capitalize("cafe")).toBe("Cafe");
        });
    });
});
