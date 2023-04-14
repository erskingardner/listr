<script lang="ts">
    import { currentUser } from '$lib/stores/currentUser';
</script>

<div class="mt-40">
    <hr />
    <div class="font-mono mt-4">
        <p>Current user: {$currentUser?.npub || 'None'}</p>
    </div>
</div>
