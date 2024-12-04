<script lang="ts">
import { Zap } from "lucide-svelte";

let {
    donateButtonClicked,
    extraClasses,
}: { donateButtonClicked: () => void; extraClasses: string } = $props();
</script>

<button
    onclick={donateButtonClicked}
    class={extraClasses}
>
    <Zap strokeWidth="1.5" size="20" class="w-5 h-5" />
    Zap Listr
</button>
