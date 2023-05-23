# Listr

A simple app for managing and discovering Nostr lists.

### 📥 Todo

-   FIX: Wrap list and list items in keys? To make sure updates are picked up and shown??
-   Refactor: Lists, List, List Form, List actions into individual components
-   Social interactions on lists
    -   likes
    -   zaps
    -   comments
-   private list items
-   Add follow button to notes feed, people lists, etc. (only for logged in users)

### 👨🏼‍💻 In Progress

-   Update List items that are notes to use the new Note component

### ✅ Done

-   Fix bug with NIP07Signer
-   Show feed of notes for users in list
    -   Show more details of note, link to note in primal.
-   FIX: Fix issue creating multiple of the same list when refreshing the naddr page.
-   Add donation button
-   Remove items from a list
-   Fix avatar image aspect ratio
-   Figure out why the new list is being loaded with two of the same last item instead of showing the new item.
-   Create completely new lists
-   Mobile UX for adding items
-   Make sure to add the events immediately to the list when added
    -   Move list event submission to naddr page (pushed up through dispatch)
    -   addition of valid item should create row on list (shown as unpublished)
    -   create a button at top of list to trigger submission/publish
    -   submission should create new event, sign it, broadcast
    -   on successful broadcast, add new object to localDB, refetch list on the page to update.
-   Handle duplicate list types
-   Rejig how we fetch and store lists to handle nip19 pointers better
-   Add new items to a list
    -   Disable submit button if errors
    -   Validate type of list you're adding to and types of ids that are valid
    -   Handle submit (creation of new list event, signature, broadcast)
-   Double check basic mobile compat
-   Rotating list of people for homepage
-   Light mode design improvements
-   Create a people card for homepage people examples with avatar
-   Create Search so you can search by user npub.
-   Dedupe lists that are fetched so that we only store 1 per kind in the db.
    -   Get a list of events from relays
    -   Get a list of events we have in the db
    -   Compare and keep only one of each kind:name
    -   Put that latest event in the db
-   Show users and events from lists in UI when fetched.
-   Create landing page at `/` to explain the benefit of the app
-   Create Interface to fetch repaceable lists (kind: 10000, 10001, 30000, 30001)
-   Fix `[npub]/lists` route so that it shows profile data on refresh – I think this will be fixed by the database stuff.
-   Implement simple browser database with Dexie
-   Profile page
-   Integrate NDK
-   Light/Dark mode
-   Basic design

### ⌛ Later

-   Allow updating your own profile
-   Validate event signatures
-   Delete entire lists (https://github.com/nostr-protocol/nips/blob/master/09.md)
-   Handling renaming of lists?! Is this even possible?
