<span class="loader {$$props.class}"></span>

<style lang="postcss">
    .loader {
        @apply border-4 border-gray-200 border-t-indigo-600 rounded-full w-12 h-12;
        animation: spin 1.2s cubic-bezier(1, 0.7, 0.3, 0.8) infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
