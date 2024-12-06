export const load = async ({ cookies }) => {
    const listrCookie = cookies.get("listrUserNpub");
    return { listrCookie };
};
