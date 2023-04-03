import type { NDKTag } from '@nostr-dev-kit/ndk/dist/types/events';

declare global {
    namespace App {
        interface Settings {
            theme: string;
        }

        interface MuteList {
            publicList: NDKTag[];
            privateList: NDKTag[];
        }

        interface PinList {
            publicList: NDKTag[];
            privateList: NDKTag[];
        }

        interface CategorizedPeopleList {
            publicList: NDKTag[];
            privateList: NDKTag[];
        }

        interface CategorizedBookmarksList {
            publicList: NDKTag[];
            privateList: NDKTag[];
        }

        // interface Errors {}
        // interface Locals {}
        // interface PageData {}
        // interface Platform {}
    }
}

export {};
