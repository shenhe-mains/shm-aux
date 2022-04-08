export const exorcium = "<:exorcium:947302445594316800>";

export function display_time(date, flag) {
    return `<t:${Math.floor(date.getTime() / 1000)}${flag ? `:${flag}` : ""}>`;
}
