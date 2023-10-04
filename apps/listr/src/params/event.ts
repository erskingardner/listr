/** @type {import('@sveltejs/kit').ParamMatcher} */

export function match(param) {
    return /^(nevent1|note1)[a-zA-Z0-9]*/.test(param);
}
