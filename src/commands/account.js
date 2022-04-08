import { Command } from "paimon.js";
import { get_account } from "../lib/accounts.js";
import { exorcium } from "../lib/format.js";

export default new Command({
    name: "account",
    description: "View your or another user's account.",
    options: ["u:user* the user to view"],
    async execute(cmd, user) {
        user ??= cmd.user;

        const account = await get_account(user.id);

        await cmd.replyEmbed({
            title: `${user.tag}'s Account`,
            fields: [
                {
                    name: "Tag",
                    value: `${user} \`${user.id}\``,
                },
                {
                    name: "**Balance**",
                    value: `${account.money} ${exorcium}`,
                },
            ],
        });
    },
});
