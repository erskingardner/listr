import { defineParams } from "@sveltejs/kit/params";
import { match as matchEvent } from "./params/event.ts";
import { match as matchNip19 } from "./params/nip19.ts";
import { match as matchPre } from "./params/pre.ts";
import { match as matchUser } from "./params/user.ts";

/** Validate route identifiers and preserve their string values for route consumers. */
export const params = defineParams({
    event: (value) => (matchEvent(value) ? value : undefined),
    nip19: (value) => (matchNip19(value) ? value : undefined),
    pre: (value) => (matchPre(value) ? value : undefined),
    user: (value) => (matchUser(value) ? value : undefined),
});
