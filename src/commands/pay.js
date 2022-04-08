import { Command } from "paimon.js";
import { get_balance, transfer } from "../lib/accounts.js";
import { exorcium } from "../lib/format.js";

export default new Command({
    name: "pay",
    description: "Give another user money.",
    options: [
        "u:user the user to give money to",
        "i:amount:1- the amount to give",
    ],
    async execute(cmd, user, amount) {
        if (cmd.user.id == user.id) {
            await cmd.replyEmbed({
                title: "Invalid Target",
                description: "You cannot pay yourself money.",
                color: "RED",
            });
            return;
        }

        if ((await get_balance(cmd.user.id)) < amount) {
            await cmd.replyEmbed({
                title: "Insufficient Funds",
                description: `You do not have ${amount} ${exorcium} to give to ${user}.`,
                color: "RED",
            });
            return;
        }

        if (user.bot) {
            await cmd.replyEmbed({
                title: "Invalid Target",
                description: `${user} is a bot and cannot receive money.`,
                color: "RED",
            });
            return;
        }

        await transfer(cmd.user.id, user.id, amount);

        await cmd.replyEmbed({
            title: "Money Transfered",
            description: `${cmd.user} gave ${user} ${amount} ${exorcium}`,
            color: "GREEN",
        });
    },
});
