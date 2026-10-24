/** Check whether an identifier matches this route parameter. */

export function match(param: string) {
    return /^^(npub1|nprofile1)[a-zA-Z0-9]*/.test(param);
}
