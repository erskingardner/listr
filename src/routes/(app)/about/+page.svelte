<script lang="ts">
import { goto } from "$app/navigation";
import UserDetails from "$lib/components/users/UserDetails.svelte";
import ndk from "$lib/stores/ndk.svelte";

const ids: string[] = [
    "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d", // Fiatjaf
    "1739d937dc8c0c7370aa27585938c119e25c41f6c441a5d34c6d38503e3136ef", // Me
    "d61f3bc5b3eb4400efdae6169a5c17cabf3246b514361de939ce4a1a0da6ef4a", // Miljan
    "d8a6ecf0c396eaa8f79a4497fe9b77dc977633451f3ca5c634e208659116647b", // Lola L33tz
    "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245", // JB55
    "92de68b21302fa2137b1cbba7259b8ba967b535a05c6d2b0847d9f35ff3cf56a", // SusieBdds
    "bf2376e17ba4ec269d10fcc996a4746b451152be9031fa48e74553dde5526bce", // Carla
    "460c25e682fda7832b52d1f22d3d22b3176d972f60dcdc3212ed8c92ef85065c", // Vitor
    "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93", // Gigi
    "cc8d072efdcc676fcbac14f6cd6825edc3576e55eb786a2a975ee034a6a026cb", // Sherry
    "0114bb11dd8eb89bfb40669509b2a5a473d27126e27acae58257f2fd7cd95776", // Laura
    "26bd32c67232bdf16d05e763ec67d883015eb99fd1269025224c20c6cfdb0158", // Marce
    "3829e00e2b7f81f94fa1103ede83be1f140724299c9a3732f68abd38c307525e", // Proton
    "b6dcdddf86675287d1a4e8620d92aa905c258d850bf8cc923d39df1edfee5ee7", // Geyser
    "148d1366a5e4672b1321adf00321778f86a2371a4bdbe99133f28df0b3d32fa1", // Brad Mills
    "58c741aa630c2da35a56a77c1d05381908bd10504fdd2d8b43f725efa6d23196", // Gladstein
    "3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767", // DJ Val
    "50d94fc2d8580c682b071a542f8b1e31a200b0508bab95a33bef0855df281d63", // Calle
    "6c6e3e05e1c9d2aae0ed2431544aea411771dd9d81017539af0fd818b2389f28", // Sasha
];

const shuffled = ids.sort(() => 0.5 - Math.random()).slice(0, 9);
const users = shuffled.map((id) => ndk.getUser({ pubkey: id }));
</script>

<svelte:head>
    <title>About - Listr</title>
    <meta
        name="description"
        content="Learn more about Listr, the best app for creating and managing your Nostr lists."
    />
</svelte:head>

<div class="prose max-w-4xl dark:prose-invert">
    <h2 class="">Listr is a simple tool that allows you to browse and manage Nostr lists.</h2>
    <p>Check out a few examples, then sign in to view your own!</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose">
        {#each users as user (user.pubkey)}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                onclick={() => (goto(`/${user.npub}`))}
                class="flex p-4 border border-gray-300 cursor-pointer rounded-md shadow-md bg-gray-50 dark:bg-gray-700 dark:border-gray-800 dark:text-gray-50 truncate hover:dark:bg-gray-600"
            >
                <UserDetails {user} noPopover={true} />
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
            <col class="lg:w-52" />
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
