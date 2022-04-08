import { Command } from "paimon.js";
import { get_top } from "../lib/accounts.js";
import { exorcium } from "../lib/format.js";

export default new Command({
    name: "topbalance",
    description: "Get the richest users (groups of 20).",
    options: ["i:page*:1- page number"],
    async execute(cmd, page) {
        page ??= 1;

        const entries = await get_top(page - 1);

        await cmd.replyEmbed({
            title: `Top Users by Balance`,
            description:
                entries
                    .filter((entry) => entry.user_id.match(/\d+/))
                    .map(
                        (entry, index) =>
                            `\`${index + page * 20 - 20 + 1}.\` <@${
                                entry.user_id
                            }>: ${entry.money} ${exorcium}`
                    )
                    .join("\n") || "(empty)",
            footer: { text: `Page ${page}` },
        });
    },
});
