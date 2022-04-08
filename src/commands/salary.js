import { Command } from "paimon.js";
import db from "../db.js";
import {
    add_money,
    get_account,
    get_balance,
    transfer,
} from "../lib/accounts.js";
import { display_time, exorcium } from "../lib/format.js";

export default new Command({
    name: "salary",
    description: "Get your daily salary.",
    options: [],
    async execute(cmd) {
        const last = (await get_account(cmd.user.id)).last_salary;
        const now = new Date();

        if (
            last &&
            now.getDate() == last.getDate() &&
            now.getMonth() == last.getMonth() &&
            now.getFullYear() == last.getFullYear()
        ) {
            now.setDate(now.getDate() + 1);

            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);

            return `You can only use this command once every day. The next reset is ${display_time(
                now,
                "R"
            )}`;
        }

        const broke = (await get_balance(cmd.user.id)) < 5000;
        const amount = Math.floor(
            (Math.random() * 500 + 500) * (broke ? 1.5 : 1)
        );

        await transfer("salary-payout", cmd.user.id, amount);

        await db.accounts.findOneAndUpdate(
            { user_id: cmd.user.id },
            { $set: { last_salary: now } },
            { upsert: true }
        );

        await cmd.replyEmbed({
            title: "Salary given",
            description: `You received ${amount} ${exorcium}${
                broke ? " (+50%)" : ""
            }.`,
            color: "GREEN",
        });
    },
});
