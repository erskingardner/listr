import "websocket-polyfill";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
    const listrCookie = cookies.get("listrUserNpub");

    // process.on("unhandledRejection", (reason, p) => {
    //     console.log("Unhandled Rejection at: Promise", p, "reason:", reason);
    //     // application specific logging, throwing an error, or other logic here
    // });

    return { listrCookie };
};
