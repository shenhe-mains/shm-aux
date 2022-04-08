import DME from "discord-markdown-embeds";
import { res } from "file-ez";
import fs from "fs";
import { Command } from "paimon.js";

export default new Command({
    name: "help",
    description: "Get bot help.",
    options: [["s:item* what to get help on", "blackjack"]],
    async execute(cmd, item) {
        item ??= "main";
        await cmd.reply({
            embeds: DME.render(
                fs.readFileSync(res(`../help/${item}.md`), "utf-8")
            ),
        });
    },
});
