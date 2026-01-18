import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import toast from "svelte-hot-french-toast";
import { goto } from "$app/navigation";

/**
 * Signs the user out using NDK's built-in session management.
 */
export function signout(ndk: NDKSvelte) {
    ndk.$sessions?.logout();
    toast.success("Signed out");
    goto("/");
}
