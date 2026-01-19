/** @type {import('@sveltejs/kit').ParamMatcher} */

export function match(param: string) {
    // Match NIP-19 identifiers used for list references:
    // - naddr1: addressable event references (parameterized replaceable lists like 30000, 30001)
    // - nevent1: event references (simple replaceable lists like 10000, 10004, 3)
    return /^(naddr1|nevent1)[a-zA-Z0-9]+$/.test(param);
}
