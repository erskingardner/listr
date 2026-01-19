import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signout } from "./auth";

// Mock svelte-hot-french-toast
vi.mock("svelte-hot-french-toast", () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock $app/navigation
vi.mock("$app/navigation", () => ({
    goto: vi.fn(),
}));

import toast from "svelte-hot-french-toast";
import { goto } from "$app/navigation";

describe("auth utility functions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("signout", () => {
        it("should call logout on ndk sessions", () => {
            const mockLogout = vi.fn();
            const mockNdk = {
                $sessions: {
                    logout: mockLogout,
                },
            } as unknown as NDKSvelte;

            signout(mockNdk);

            expect(mockLogout).toHaveBeenCalledTimes(1);
        });

        it("should show success toast after signing out", () => {
            const mockNdk = {
                $sessions: {
                    logout: vi.fn(),
                },
            } as unknown as NDKSvelte;

            signout(mockNdk);

            expect(toast.success).toHaveBeenCalledWith("Signed out");
        });

        it("should redirect to home page after signing out", () => {
            const mockNdk = {
                $sessions: {
                    logout: vi.fn(),
                },
            } as unknown as NDKSvelte;

            signout(mockNdk);

            expect(goto).toHaveBeenCalledWith("/");
        });

        it("should handle ndk with undefined $sessions gracefully", () => {
            const mockNdk = {
                $sessions: undefined,
            } as unknown as NDKSvelte;

            // Should not throw, using optional chaining
            expect(() => signout(mockNdk)).not.toThrow();
            expect(toast.success).toHaveBeenCalledWith("Signed out");
            expect(goto).toHaveBeenCalledWith("/");
        });

        it("should handle ndk with null $sessions gracefully", () => {
            const mockNdk = {
                $sessions: null,
            } as unknown as NDKSvelte;

            // Should not throw, using optional chaining
            expect(() => signout(mockNdk)).not.toThrow();
            expect(toast.success).toHaveBeenCalledWith("Signed out");
            expect(goto).toHaveBeenCalledWith("/");
        });

        it("should call operations in correct order", () => {
            const callOrder: string[] = [];
            const mockLogout = vi.fn(() => callOrder.push("logout"));
            vi.mocked(toast.success).mockImplementation(() => {
                callOrder.push("toast");
                return "";
            });
            vi.mocked(goto).mockImplementation(() => {
                callOrder.push("goto");
                return Promise.resolve();
            });

            const mockNdk = {
                $sessions: {
                    logout: mockLogout,
                },
            } as unknown as NDKSvelte;

            signout(mockNdk);

            expect(callOrder).toEqual(["logout", "toast", "goto"]);
        });
    });
});
