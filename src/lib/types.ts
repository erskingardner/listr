export interface ListItemParams {
    type: string;
    id: string;
    privateItem: boolean;
    unsaved: boolean;
    removal: boolean;
    otherTagValues: string[] | undefined;
}
// Copied from nostr-tools
export type AddressPointer = {
    identifier: string;
    pubkey: string;
    kind: number;
    relays?: string[];
};
