/** @type {import('@sveltejs/kit').ParamMatcher} */

export function match(param) {
    return /^^(npub1|nprofile1)[a-zA-Z0-9]*/.test(param);
}
