import type { Handle } from "@sveltejs/kit";

function redirect(location: string, body?: string) {
    return new Response(body, {
        status: 303,
        headers: { location },
    });
}

const protectedRoutes: string[] = ["/new", "/settings"];

export const handle: Handle = async ({ event, resolve }) => {
    const sessionCookie = event.cookies.get("listrUserNpub");
    if (!sessionCookie && protectedRoutes.includes(event.url.pathname)) {
        throw redirect("/", "Please log in");
    }

    return resolve(event);
};
