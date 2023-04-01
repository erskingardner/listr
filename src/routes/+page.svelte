<script lang="ts">
    import { authedPubkey, authedProfileMetadata, theme } from '$lib/store';
</script>

<p>Current theme: {$theme}</p>
<p>Current user: {$authedPubkey}</p>
