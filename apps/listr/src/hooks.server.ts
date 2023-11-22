import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

const protectedRoutes: string[] = ["/new", "/settings", "/merge"];

export const handle: Handle = async ({ event, resolve }) => {
    const sessionCookie = event.cookies.get("listrUserNpub");
    if (!sessionCookie && protectedRoutes.includes(event.url.pathname)) {
        throw redirect(303, "/");
    }

    return resolve(event);
};
