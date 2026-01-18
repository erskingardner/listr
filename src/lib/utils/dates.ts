import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function unixTimeNowInSeconds() {
    return Math.floor(Date.now() / 1000);
}

export function dateTomorrow() {
    return new Date(Date.now() + 3600 * 1000 * 24);
}

export function formattedDate(unixTimestampInSeconds: number): string {
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const date = new Date(unixTimestampInSeconds * 1000);
    return date.toLocaleDateString("en-US", options);
}

export function timeAgo(unixTimestampInSeconds: number): string {
    return dayjs().to(dayjs.unix(unixTimestampInSeconds));
}
