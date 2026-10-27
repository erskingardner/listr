/** Check whether an identifier matches this route parameter. */

export function match(param: string) {
    return /^(nevent1|note1)[a-zA-Z0-9]*/.test(param);
}
