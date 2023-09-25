<script lang="ts">
    import UserDetails from "$lib/components/users/UserDetails.svelte";
    export let data;
</script>

<div class="prose max-w-4xl">
    <h2 class="">Listr is a simple tool that allows you to browse and manage Nostr lists.</h2>
    <p>Check out a few examples, then sign in to view your own!</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose">
        {#each data.users as user (user.hexpubkey)}
            <div class="p-4 border border-gray-300 rounded-md shadow-md bg-gray-50">
                <UserDetails {user} />
            </div>
        {/each}
    </div>
    <h2>What are lists?</h2>
    <p>
        Lists in Nostr are defined in <a
            href="https://github.com/nostr-protocol/nips/blob/master/51.md"
            target="_blank">NIP-51</a
        >. There are several different types of lists. All types of lists are replaceable, meaning
        that only the most recent event (version of your list) matters.
    </p>
    <h3>The various types of lists</h3>
    <table class="text-base listTable">
        <colgroup>
            <col class="w-52" />
            <col />
            <col />
        </colgroup>
        <thead>
            <tr class="font-medium">
                <th>List</th>
                <th>Kind</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Contacts</td>
                <td>3</td>
                <td>This is a list of contacts that a user follows.</td>
            </tr>
            <tr>
                <td>Mute</td>
                <td>10000</td>
                <td>This is a list of a user's muted users and conversations.</td>
            </tr>
            <tr>
                <td>Pin</td>
                <td>10001</td>
                <td>This is a list of a user's pinned conversations.</td>
            </tr>
            <tr>
                <td>Relays</td>
                <td>10002</td>
                <td>This is a list of a user's current preferred relays.</td>
            </tr>
            <tr>
                <td>Categorized People</td>
                <td>30000</td>
                <td>
                    This is a list of users with a title. Hence, you can store any type of people
                    list you'd like.
                </td>
            </tr>
            <tr>
                <td>Categorized Bookmarks</td>
                <td>30001</td>
                <td>
                    This is a list of notes with a title. Hence, you can store any arbitrary list of
                    notes you'd like.
                </td>
            </tr>
            <tr>
                <td>Categorized Relays</td>
                <td>30022</td>
                <td>
                    This is a list of relays. You can name the list to specify the significance of
                    these relays.
                </td>
            </tr>
        </tbody>
    </table>
    <h3>Public and private items in lists</h3>
    <p>
        All lists have a mechanism to store values in a public or private way. When you add items to
        your lists in Listr you'll notice that you have an option to set the item as public or
        private. When you add private items they are encrypted so that only you can see them.
    </p>
</div>
