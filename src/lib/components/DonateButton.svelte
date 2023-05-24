<script lang="ts">
    export let variant: string = 'primary';
    export let classes: string = '';

    const variantStyles = {
        primary:
            'h-fit transition-all rounded-md bg-indigo-600/80 py-1 px-3 text-white hover:bg-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-400 ring-1 ring-inset ring-indigo-400/40 dark:hover:bg-indigo-400/20 dark:hover:text-indigo-300 hover:ring-indigo-300 border-0',
        secondary:
            'h-fit transition-all rounded-md bg-zinc-100 py-1 px-3 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:ring-1 dark:ring-inset dark:ring-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-300',
        filled: 'h-fit transition-all rounded-md bg-zinc-900 py-1 px-3 text-white hover:bg-zinc-700 dark:bg-zinc-500 dark:text-white dark:hover:bg-zinc-400',
        outline:
            'h-fit transition-all rounded-md py-1 px-3 text-zinc-700 ring-1 ring-inset ring-zinc-900/10 hover:bg-zinc-900/2.5 hover:text-zinc-900 dark:text-zinc-400 dark:ring-white/10 dark:hover:bg-white/5 dark:hover:text-white',
        text: 'h-fit transition-all text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-500'
    };

    // @ts-ignore
    let classNames = `${classes} ${variantStyles[variant]} no-underline`;
</script>

<button
    data-npub="npub1lstr2kmdthkgfuzne8e4cn2nhr646x8jt25szdj7t4wr6xemtuuq3lczsj"
    class={classNames}
>
    ⚡ Donate to Listr
</button>
