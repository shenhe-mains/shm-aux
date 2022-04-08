import { Command } from "paimon.js";
import config from "../config.js";
import { add_money, transfer } from "../lib/accounts.js";
import { exorcium } from "../lib/format.js";

export default [
    new Command({
        name: "banker give",
        description: "Give money to a user or role.",
        options: [
            "p:target target to give money to",
            "i:amount:1- amount to give (per user)",
        ],
        async execute(cmd, target, amount) {
            if (config.owners.indexOf(cmd.user.id) == -1) {
                return "You do not have permission to use this command.";
            }

            let members;

            if (target.members) {
                members = target.members.toJSON();
            } else {
                members = [target];
            }

            for (const member of members) {
                await add_money(member.id, amount);
            }

            await add_money("bank", -amount * members.length);

            await cmd.replyEmbed({
                title: "Money Given",
                description: `${
                    members.length == 1
                        ? "1 member was"
                        : `${members.length} members were`
                } given ${amount} ${exorcium}${
                    members.length == 1 ? "" : " each"
                }.`,
                color: "GREEN",
            });
        },
    }),

    new Command({
        name: "banker fine",
        description: "Fine a user.",
        options: [
            "u:user the user to fine",
            "i:amount:1- the amount to take away",
        ],
        async execute(cmd, user, amount) {
            if (config.owners.indexOf(cmd.user.id) == -1) {
                return "You do not have permission to use this command.";
            }

            await transfer(user.id, "bank", amount);

            await cmd.replyEmbed({
                title: `${user.tag} Fined`,
                description: `${user} was fined ${amount} ${exorcium}`,
                color: "GREEN",
            });
        },
    }),
];
