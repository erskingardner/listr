<script lang="ts">
    import { PlusCircle } from "lucide-svelte";

    export let buttonText: string;
</script>

<a
    href="/new"
    class="group flex gap-x-3 rounded-md items-center p-2 text-sm font-semibold leading-6 text-gray-200 bg-indigo-600 hover:bg-indigo-500 hover:text-white {$$props.class}"
>
    <PlusCircle strokeWidth="1.5" size="20" class="w-5 h-5" />
    {buttonText}
</a>
