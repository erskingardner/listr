# Listr

A simple app for managing and discovering Nostr lists.

### 📥 Todo

-   Dedupe lists that are fetched so that we only store 1 per kind in the db.
    -   Get a list of events from relays
    -   Get a list of events we have in the db
    -   Compare and keep only one of each kind:name
    -   Put that latest event in the db
-   Show users and events from lists in UI when fetched.
-   Create landing page at `/` to explain the benefit of the app
-   LAUNCH POINT
-   Create Search so you can search by user npub.
-   Create interface to create new lists and publish them
-   Create interface to edit you lists and publish them

### 👨🏼‍💻 In Progress

### ✅ Done

-   Create Interface to fetch repaceable lists (kind: 10000, 10001, 30000, 30001)
-   Fix `[npub]/lists` route so that it shows profile data on refresh – I think this will be fixed by the database stuff.
-   Implement simple browser database with Dexie
-   Profile page
-   Integrate NDK
-   Light/Dark mode
-   Basic design

### ⌛ Later

-   Allow updating your own profile
