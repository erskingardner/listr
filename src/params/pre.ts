/** Check whether an identifier matches this route parameter. */

export function match(param: string) {
    return /^^(naddr1)[a-zA-Z0-9]*/.test(param);
}
