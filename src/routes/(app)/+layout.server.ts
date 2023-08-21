import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
    const listrCookie = cookies.get("listrUserNpub");

    return { listrCookie };
};
