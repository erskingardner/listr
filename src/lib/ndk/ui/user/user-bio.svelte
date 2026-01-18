<!--
	Installed from @ndk/svelte
-->

<script lang="ts">
import { getContext } from "svelte";
import { cn } from "../../utils/cn.js";
import { USER_CONTEXT_KEY, type UserContext } from "./user.context.js";

interface Props {
    class?: string;
}

let { class: className = "" }: Props = $props();

const context = getContext<UserContext>(USER_CONTEXT_KEY);
if (!context) {
    throw new Error("User.Bio must be used within User.Root");
}

const bio = $derived(context.profile?.about || "");
</script>

{#if bio}
  <p data-user-bio="" class={cn(className)}>
    {bio}
  </p>
{/if}
