<script lang="ts">
    import { currentUser } from '$lib/stores/currentUser';
    import { settings } from '$lib/stores/settings';
</script>

<p>Current theme: {$settings.theme}</p>
<p>Current user: {$currentUser?.npub || 'None'}</p>
<hr />
