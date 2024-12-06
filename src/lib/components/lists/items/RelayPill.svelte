<script lang="ts">
import { capitalize } from "$lib/utils";

let {
    marker,
}: {
    marker: string | undefined;
} = $props();
</script>

<span class="text-2xs text-white md:text-xs px-1.5 md:px-2 md:py-0.5 bg-blue-600 rounded-full">
    {marker ? capitalize(marker) : "Read & Write"}
</span>
