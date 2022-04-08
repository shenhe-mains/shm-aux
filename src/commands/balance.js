import { Command } from "paimon.js";
import { get_account } from "../lib/accounts.js";
import { exorcium } from "../lib/format.js";

export default new Command({
    name: "balance",
    description: "Get your or another user's balance.",
    options: ["u:user* the user to view"],
    async execute(cmd, user) {
        user ??= cmd.user;

        const { money } = await get_account(user.id);

        await cmd.replyEmbed({
            title: `${user.tag}'s Balance`,
            description: `${user} has ${money} ${exorcium}`,
        });
    },
});
