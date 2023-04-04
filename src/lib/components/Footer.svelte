<script lang="ts">
    import { currentUser } from '$lib/stores/currentUser';
    import { settings } from '$lib/stores/settings';
</script>

<div class="mt-40">
    <hr />
    <div class="font-mono mt-4">
        <p>Current theme: {$settings.theme}</p>
        <p>Current user: {$currentUser?.npub || 'None'}</p>
    </div>
</div>
