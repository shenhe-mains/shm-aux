import db from "../db.js";

await db.init("accounts");

export async function get_account(user_id) {
    return (await db.accounts.findOne({ user_id })) ?? { user_id, money: 0 };
}

export async function get_balance(user_id) {
    return ((await db.accounts.findOne({ user_id })) ?? { money: 0 }).money;
}

export async function get_top(page) {
    return (await db.accounts.find().toArray())
        .sort((a, b) => b.money - a.money)
        .slice(page * 20, page * 20 + 20);
}

export async function set_money(user_id, amount) {
    await db.accounts.findOneAndUpdate(
        { user_id },
        { $set: { money: amount } },
        { upsert: true }
    );
}

export async function add_money(user_id, amount) {
    await db.accounts.findOneAndUpdate(
        { user_id },
        { $inc: { money: amount } },
        { upsert: true }
    );
}

export async function transfer(source, target, amount) {
    await add_money(source, -amount);
    await add_money(target, amount);
}
