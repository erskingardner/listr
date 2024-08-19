<script lang="ts">
    import { Zap } from "lucide-svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
</script>

<button on:click={() => dispatch("donateButtonClicked")} class={$$props.class}>
    <Zap strokeWidth="1.5" size="20" class="w-5 h-5" />
    Zap Listr
</button>
