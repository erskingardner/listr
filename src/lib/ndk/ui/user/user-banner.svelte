<!--
	Installed from @ndk/svelte
-->

<script lang="ts">
import { getContext } from "svelte";
import { USER_CONTEXT_KEY, type UserContext } from "./user.context.js";

interface Props {
    class?: string;
}

let { class: className = "" }: Props = $props();

const context = getContext<UserContext>(USER_CONTEXT_KEY);
if (!context) {
    throw new Error("User.Banner must be used within User.Root");
}

const profile = $derived(context.profile);

let imageLoaded = $state(false);
let imageError = $state(false);

$effect(() => {
    if (profile?.banner) {
        imageLoaded = false;
        imageError = false;
    }
});

function handleImageLoad() {
    imageLoaded = true;
    imageError = false;
}

function handleImageError() {
    imageLoaded = false;
    imageError = true;
}

const showImage = $derived(profile?.banner && imageLoaded && !imageError);
</script>

<div
  data-user-banner=""
  class="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 {className}"
  class:animate-pulse={!imageLoaded}
>
  {#if profile?.banner}
    <img
      src={profile.banner}
      alt="Profile banner"
      class="w-full h-full object-cover"
      class:opacity-0={!imageLoaded}
      onload={handleImageLoad}
      onerror={handleImageError}
    />
  {/if}
</div>
