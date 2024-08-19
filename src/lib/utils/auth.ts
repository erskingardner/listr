import { browser } from "$app/environment";
import { get } from "svelte/store";
import currentUser from "$lib/stores/currentUser";
import { currentUserFollows, currentUserSettings } from "$lib/stores/currentUser";
import { fetchUserFollows, fetchUserSettings } from "$lib/stores/currentUser";
import type NDK from "@nostr-dev-kit/ndk";
import {
    NDKNip07Signer,
    NDKNip46Signer,
    NDKPrivateKeySigner,
    type NDKUser,
} from "@nostr-dev-kit/ndk";
import { pa } from "@accuser/svelte-plausible-analytics";
import toast from "svelte-french-toast";
import { goto } from "$app/navigation";

export enum SigninMethod {
    Nip07 = "nip07",
    Nip46 = "nip46",
    PK = "pk",
}

/**
 * Attempt to signin with the same method that was previously used, or default to NIP-07 extension
 */
export async function signin(
    ndk: NDK,
    bunkerNDK?: NDK,
    method?: SigninMethod,
    token?: string
): Promise<NDKUser | null> {
    // Check if we know of the last way the user signed in
    const nostrSigninMethod = method || localStorage.getItem("nostrSigninMethod");

    let user: NDKUser | null = null;
    // Default to NIP-07 if we don't know
    if (nostrSigninMethod === SigninMethod.PK) {
        user = await userFromPrivateKey(ndk);
    } else if (nostrSigninMethod === SigninMethod.Nip46) {
        user = await userFromNip46(ndk, bunkerNDK!, token);
    } else {
        user = await userFromNip07(ndk);
    }

    if (user) {
        user.ndk = ndk;
        ndk.activeUser = user;
        currentUser.set(user);
        const currentUserStore = get(currentUser);
        document.cookie = `listrUserNpub=${user.npub}; max-age=1209600; SameSite=Lax; Secure; path=/`;
        if (window.plausible) pa.addEvent("Log in");
        toast.success("Signed in successfully");
        try {
            currentUserFollows.set(await fetchUserFollows(currentUserStore as NDKUser));
            currentUserSettings.set(await fetchUserSettings(currentUserStore as NDKUser));
        } catch (error) {
            console.error(error);
        }
    }
    return user;
}

/**
 * Retrieves a user object using a private key stored in local storage ☠️
 * @async
 * @param ndk - An instance of the NDK class.
 * @returns A Promise that resolves to an NDKUser object if the private key is found, or null otherwise.
 */
async function userFromPrivateKey(ndk: NDK): Promise<NDKUser | null> {
    const privateKey = localStorage.getItem("listrNostrPrivateKey");
    if (!privateKey) return null;

    const signer = new NDKPrivateKeySigner(privateKey);
    ndk.signer = signer;

    const user = await signer.user();
    localStorage.setItem("nostrSigninMethod", SigninMethod.PK);
    return user;
}

/**
 * Retrieves a user object using the NDKNip07Signer.
 * @async
 * @param ndk - An instance of the NDK class.
 * @returns A Promise that resolves to an NDKUser object if the NDKNip07Signer is available, or null otherwise.
 */
async function userFromNip07(ndk: NDK): Promise<NDKUser | null> {
    let user: NDKUser | null = null;
    if (browser && window.nostr) {
        try {
            ndk.signer = new NDKNip07Signer();
            user = await ndk.signer.user();
        } catch (error) {
            toast.error(error as string);
            console.error(error);
        }
    }
    localStorage.setItem("nostrSigninMethod", SigninMethod.Nip07);
    return user;
}

/**
 * Retrieves a user object using the NDKNip46Signer.
 * @async
 * @param ndk - An instance of the NDK class.
 * @param bunkerNdk - An instance of the NDK class for the Bunker server.
 * @param token - An optional token for creating a new nsecBunker connection.
 * @returns A Promise that resolves to an NDKUser object if the NDKNip46Signer is available, or null otherwise.
 */
async function userFromNip46(ndk: NDK, bunkerNdk: NDK, token?: string): Promise<NDKUser | null> {
    let localSigner: NDKPrivateKeySigner;
    let user: NDKUser | null = null;
    if (browser) {
        const storedKey = localStorage.getItem("listrNip46LocalSignerPK");
        const targetNpub = localStorage.getItem("listrNip46TargetNpub");
        // If we have a local PK and a target npub, try and sign in.
        if (storedKey && targetNpub) {
            console.log("stored key and target npub");
            localSigner = new NDKPrivateKeySigner(storedKey);
            const targetUser = ndk.getUser({ npub: targetNpub });
            const remoteSigner = new NDKNip46Signer(bunkerNdk, targetUser!.pubkey, localSigner);
            ndk.signer = remoteSigner;
            await remoteSigner.blockUntilReady();
            user = await remoteSigner.user();
        }
        // If we're missing one of the above but we have a token, try and create a new nsecBunker connection
        else if (token) {
            const localSigner = NDKPrivateKeySigner.generate();
            localStorage.setItem("listrNip46LocalSignerPK", localSigner.privateKey as string);
            const remoteSigner = new NDKNip46Signer(bunkerNdk, token, localSigner);
            ndk.signer = remoteSigner;
            try {
                await remoteSigner.blockUntilReady();
                user = await remoteSigner.user();
                localStorage.setItem("listrNip46TargetNpub", user.npub);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error) {
                toast.error(error as string);
                console.error(error);
            }
        }
        localStorage.setItem("nostrSigninMethod", SigninMethod.Nip46);
    }
    return user;
}

/**
 * Signs the user out.
 */
export function signout(ndk: NDK) {
    currentUser.set(null);
    currentUserFollows.set([]);
    ndk.activeUser = undefined;
    document.cookie = "listrUserNpub=";
    if (window.plausible) pa.addEvent("Log out");
    toast.success("Signed out");
    goto("/");
}
