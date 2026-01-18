<script lang="ts">
import { PlusCircle } from "lucide-svelte";
import { goto } from "$app/navigation";

let {
    buttonText,
    extraClasses = "",
    closeMobileMenu,
}: { buttonText: string; extraClasses?: string; closeMobileMenu?: () => void } = $props();

function handleClick(e: MouseEvent) {
    e.preventDefault();
    closeMobileMenu?.();
    goto("/new");
}
</script>

<a
    onclick={handleClick}
    href="/new"
    class="group flex gap-x-3 rounded-md items-center p-2 text-sm font-semibold leading-6 text-gray-200 bg-indigo-600 hover:bg-indigo-500 hover:text-white {extraClasses}"
>
    <PlusCircle strokeWidth="1.5" size="20" class="w-5 h-5" />
    {buttonText}
</a>
