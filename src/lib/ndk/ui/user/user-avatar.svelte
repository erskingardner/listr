<!--
	Installed from @ndk/svelte
-->

<script lang="ts">
import type { Snippet } from "svelte";
import { getContext } from "svelte";
import { isProfileNsfw } from "$lib/utils/nsfw.js";
import { cn } from "../../utils/cn.js";
import { USER_CONTEXT_KEY, type UserContext } from "./user.context.js";

interface Props {
    class?: string;

    fallback?: string;

    alt?: string;

    customFallback?: Snippet;

    /**
     * Whether to blur NSFW profile pictures.
     * When true, profiles marked as NSFW (via content-warning tag, labels, or nsfw field)
     * will have their avatar blurred.
     * @default true
     */
    blurNsfw?: boolean;
}

let { class: className = "", fallback, alt, customFallback, blurNsfw = true }: Props = $props();

const context = getContext<UserContext>(USER_CONTEXT_KEY);
if (!context) {
    throw new Error("User.Avatar must be used within User.Root");
}

const imageUrl = $derived(context.profile?.picture || fallback);

// Check if profile is marked as NSFW
const isNsfw = $derived(blurNsfw && isProfileNsfw(context.profile, context.ndkUser?.profileEvent));

let imageLoaded = $state(false);
let imageError = $state(false);

function handleImageLoad() {
    imageLoaded = true;
    imageError = false;
}

function handleImageError() {
    imageLoaded = false;
    imageError = true;
}

$effect(() => {
    // Reset loading state when imageUrl changes
    imageLoaded = false;
    imageError = false;
});
</script>

<div data-user-avatar="" class={cn("rounded-full relative w-12 h-12", className)}>
  <!-- Fallback layer (always visible until image loads) -->
  {#if !imageLoaded || !imageUrl}
    {#if customFallback}
      {@render customFallback()}
    {:else}
      <div
        class="rounded-full flex items-center justify-center w-full h-full absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-500 dark:text-gray-400 font-medium animate-pulse"
      >
        {context.ndkUser?.pubkey?.slice(0, 2).toUpperCase() ?? '??'}
      </div>
    {/if}
  {/if}

  <!-- Image layer (only visible when loaded) -->
  {#if imageUrl}
    <img
      data-user-avatar--img=""
      src={imageUrl}
      {alt}
      class={cn(
        "rounded-full object-cover block w-full h-full absolute inset-0 bg-background",
        imageLoaded ? "opacity-100" : "opacity-0",
        isNsfw && "blur-lg"
      )}
      onload={handleImageLoad}
      onerror={handleImageError}
    />
  {/if}
</div>
