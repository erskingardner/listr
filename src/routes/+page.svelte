<script lang="ts">
    import { currentUserPubkey } from '$lib/stores/currentUser';
    import { settings } from '$lib/stores/settings';
</script>

<p>Current theme: {$settings.theme}</p>
<p>Current user: {$currentUserPubkey}</p>
