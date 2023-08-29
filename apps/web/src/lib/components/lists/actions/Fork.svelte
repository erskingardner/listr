<script lang="ts">
    import { GitFork } from "lucide-svelte";
    import { Tooltip } from "flowbite-svelte";

    export let listId: string;
</script>

<button on:click={() => console.log("Implement fork list")}>
    <GitFork strokeWidth="1.5" size="20" class="stroke-gray-500 hover:stroke-black" />
</button>
<Tooltip type="light">Fork this list (create a personal copy)</Tooltip>
