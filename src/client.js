import { res } from "file-ez";
import { Client, load_all } from "paimon.js";
import { is_string } from "./lib/utils.js";

export default new Client({
    intents: 131071,
    partials: ["CHANNEL", "MESSAGE", "REACTION"],
    commands: await load_all(res("./commands")),
    events: await load_all(res("./events")),
    async before(interaction) {
        interaction.replyEmbed = async function (embed) {
            embed.color ??= "d9e9f9";

            return await interaction.reply({
                embeds: [embed],
                fetchReply: true,
            });
        };

        interaction.followUpEmbed = async function (embed) {
            embed.color ??= "d9e9f9";

            return await interaction.followUp({
                embeds: [embed],
                fetchReply: true,
            });
        };

        interaction.confirm = async function (
            embed,
            { yes, no, ephemeral, timeout, edit } = {}
        ) {
            embed ||= "Please confirm this action.";

            if (is_string(embed)) {
                embed = { title: "Confirm", description: embed };
            }

            yes ||= "CONFIRM";
            no ||= "CANCEL";

            if (is_string(yes)) yes = { label: yes };
            if (is_string(no)) no = { label: no };

            yes.style ||= "SUCCESS";
            no.style ||= "SUCCESS";

            yes.type = no.type = "BUTTON";

            yes.customId = "confirm.yes";
            no.customId = "confirm.no";

            const message = await (edit || interaction.replied
                ? interaction.editReply
                : interaction.reply
            ).bind(interaction)({
                embeds: [embed],
                components: [{ type: "ACTION_ROW", components: [yes, no] }],
                ephemeral,
                fetchReply: true,
            });

            try {
                const response = await message.awaitMessageComponent({
                    filter: (response) =>
                        response.user.id == interaction.user.id,
                    time: timeout || 60000,
                });

                if (response.customId != "confirm.yes") throw 0;

                return response;
            } catch {
                await interaction.editReply({
                    embeds: [
                        {
                            title: "Canceled",
                            description:
                                "This operation was canceled by the user or timed out.",
                            color: "RED",
                        },
                    ],
                    components: [],
                });

                return false;
            }
        };
    },
});
