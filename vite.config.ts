import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        include: ["src/**/*.{test,spec}.{js,ts}"],
        environment: "jsdom",
        globals: true,
        setupFiles: ["./src/tests/setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            reportsDirectory: "./coverage",
            include: ["src/**/*.ts"],
            exclude: [
                "src/**/*.test.ts",
                "src/**/*.spec.ts",
                "src/**/*.svelte.ts",
                "src/tests/**",
                "src/app.d.ts",
                "src/**/*.d.ts",
                // Files that require browser APIs, NDK, or SvelteKit server context
                "src/lib/utils/auth.ts",
                "src/lib/utils/nostr.ts", // getUserAndProfile uses ndkStore
                "src/hooks.server.ts",
                "src/routes/**/*.server.ts",
                "src/lib/types.ts", // Type definitions only, no runtime code
            ],
        },
    },
});
