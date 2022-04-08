import { Command } from "paimon.js";
import { get_balance, transfer } from "../lib/accounts.js";
import { exorcium } from "../lib/format.js";

export default new Command({
    name: "blackjack",
    description: "Play a game of Blackjack against the house.",
    options: ["i:bet:0- the amount to bet"],
    async execute(cmd, bet) {
        if (bet > 0 && (await get_balance(cmd.user.id)) < bet) {
            await cmd.replyEmbed({
                title: "Insufficient Funds",
                description: `You do not have ${bet} ${exorcium} available to bet.`,
                color: "RED",
            });
            return;
        }

        await transfer(cmd.user.id, "casino", bet);

        try {
            const cards = ["♥️", "♦️", "♠️", "♣️"]
                .map((suit) =>
                    [
                        ["A", 0],
                        ["2", 2],
                        ["3", 3],
                        ["4", 4],
                        ["5", 5],
                        ["6", 6],
                        ["7", 7],
                        ["8", 8],
                        ["9", 9],
                        ["10", 10],
                        ["J", 10],
                        ["Q", 10],
                        ["K", 10],
                    ].map(([name, value]) => ({
                        name: `\`${name}${suit}\``,
                        value,
                    }))
                )
                .flat();

            const draw = () =>
                cards.splice(Math.floor(Math.random() * cards.length), 1)[0];

            const dealer = [draw(), draw()];
            const player = [draw(), draw()];

            const initial = `${dealer[0].name}, ${dealer[1].name}`;

            await cmd.replyEmbed({
                title: "Initial Deal",
                description: `\`Dealer\`: ${dealer[0].name}, \`??\`\n\`Player\`: ${player[0].name}, ${player[1].name}`,
                color: "AQUA",
            });

            if (blackjack(player)) {
                await transfer("casino", cmd.user.id, bet * 3);
                await cmd.followUpEmbed({
                    title: "Blackjack!",
                    description: `You got a blackjack (Ace of Spades + Black Jack)! You have been rewarded ${
                        bet * 3
                    } ${exorcium}`,
                    color: "cc00ff",
                });
            } else if (blackjack(dealer)) {
                await cmd.followUpEmbed({
                    title: "Dealer Blackjack!",
                    description: `The dealer got a blackjack (Ace of Spades + Black Jack): ${initial}! You have lost the game.`,
                    color: "RED",
                });
            } else if (hand_total(player) == 21) {
                if (hand_total(dealer) == 21) {
                    await transfer("casino", cmd.user.id, bet);
                    await cmd.followUpEmbed({
                        title: "Draw!",
                        description: `You and the dealer (${initial}) both got 21, so the game resulted in a draw and your bet has been returned.`,
                        color: "GOLD",
                    });
                } else {
                    const amount = Math.floor(bet * 1.5 + Math.random());
                    await transfer("casino", cmd.user.id, amount);

                    await cmd.followUpEmbed({
                        title: "Win!",
                        description: `Your starting hand was worth 21 so you immediately win ${amount} ${exorcium}`,
                        color: "GREEN",
                    });
                }
            } else if (hand_total(dealer) == 21) {
                await cmd.followUpEmbed({
                    title: "Loss!",
                    description: `The dealer's starting hand was worth 21: ${initial}! You have lost the game.`,
                    color: "RED",
                });
            } else if (hand_total(player) > 21) {
                if (hand_total(dealer) > 21) {
                    await transfer("casino", cmd.user.id, bet);
                    await cmd.followUpEmbed({
                        title: "Draw!",
                        description: `Your hand and the dealer's hand (${initial}) both went bust immediately, so the game resulted in a draw and your bet has been returned.`,
                        color: "GOLD",
                    });
                } else {
                    await cmd.followUpEmbed({
                        title: "Bust!",
                        description: `Your starting hand went bust and the dealer's didn't (${initial}), so you have lost the game!`,
                        color: "RED",
                    });
                }
            } else {
                const embed = () => ({
                    title: "Pick an action!",
                    description: `Your bet is ${bet} ${exorcium}. Your hand is ${player
                        .map((card) => card.name)
                        .join(", ")} (total ${hand_total(
                        player
                    )}). You can HIT (take another card), DOUBLE (double your bet and take another card), FORFEIT (surrender half of your bet and receive the other half back), or STAND (keep your hand and finish the game). **If you do not choose an action within 5 minutes, you will automatically FORFEIT.**`,
                    color: "AQUA",
                });

                const buttons = async () => {
                    const disable_double =
                        (await get_balance(cmd.user.id)) < bet || bet == 0;

                    return [
                        {
                            type: "ACTION_ROW",
                            components: [
                                ["PRIMARY", "HIT"],
                                ["SUCCESS", "DOUBLE"],
                                ["DANGER", "FORFEIT"],
                                ["SECONDARY", "STAND"],
                            ].map(([style, label]) => ({
                                type: "BUTTON",
                                style,
                                customId: `blackjack.${label.toLowerCase()}`,
                                label,
                                disabled: label == "DOUBLE" && disable_double,
                            })),
                        },
                    ];
                };

                const message = await cmd.followUp({
                    embeds: [embed()],
                    components: await buttons(),
                    fetchReply: true,
                });

                while (true) {
                    let action, response;

                    try {
                        action = (response =
                            await message.awaitMessageComponent({
                                filter: (response) =>
                                    response.user.id == cmd.user.id,
                                time: 300000,
                            })).customId;
                    } catch {
                        action = "blackjack.forfeit";
                    }

                    if (action == "blackjack.double") {
                        if (bet == 0) {
                            await response.reply({
                                content:
                                    "You are currently playing for free so this action doesn't make sense.",
                                ephemeral: true,
                            });
                        } else if ((await get_balance(cmd.user.id)) < bet) {
                            await response.reply({
                                content: `You do not have ${bet} ${exorcium} available to double your bet.`,
                                ephemeral: true,
                            });
                        } else {
                            await transfer(cmd.user.id, "casino", bet);
                            bet *= 2;
                        }
                    }

                    const reply = response
                        ? response.update.bind(response)
                        : message.edit.bind(message);

                    if (
                        action == "blackjack.hit" ||
                        action == "blackjack.double"
                    ) {
                        const last = draw();
                        player.push(last);
                        const total = hand_total(player);

                        if (total > 21) {
                            return await reply({
                                embeds: [
                                    {
                                        title: "Bust!",
                                        description: `You drew a ${last.name} and your total is ${total} > 21, so you have lost!`,
                                        color: "RED",
                                    },
                                ],
                                components: [],
                            });
                        } else if (total < 21) {
                            await reply({
                                embeds: [embed()],
                                components: await buttons(),
                            });
                        } else {
                            await reply({
                                embeds: [
                                    {
                                        title: "21!",
                                        description: `You drew a ${last.name} and your total is 21. Proceeding to the next phase...`,
                                        color: "GREEN",
                                    },
                                ],
                                components: [],
                            });
                            break;
                        }
                    } else if (action == "blackjack.forfeit") {
                        const returned = Math.floor(bet / 2 + Math.random());

                        await transfer("casino", cmd.user.id, returned);

                        return await reply({
                            embeds: [
                                {
                                    title: "Forfeited!",
                                    description: `You forfeited and received ${returned} ${exorcium} back!`,
                                    color: "ORANGE",
                                },
                            ],
                            components: [],
                        });
                    } else if (action == "blackjack.stand") {
                        await reply({
                            embeds: [
                                {
                                    title: "Standing!",
                                    description:
                                        "Proceeding to the next phase...",
                                    color: "GREEN",
                                },
                            ],
                            components: [],
                        });
                        break;
                    }
                }

                while (hand_total(dealer) < 17) {
                    dealer.push(draw());
                }

                const dt = hand_total(dealer);
                const pt = hand_total(player);
                const win = dt > 21 || pt > dt;
                const amount = Math.floor(bet * 1.5 + Math.random());

                if (pt == dt) {
                    await transfer("casino", cmd.user.id, bet);
                } else if (win) {
                    await transfer("casino", cmd.user.id, amount);
                }

                await cmd.followUpEmbed({
                    title: pt == dt ? "Draw!" : win ? "Win!" : "Loss!",
                    description: `\`Dealer\`: ${dealer
                        .map((card) => card.name)
                        .join(", ")} (${dt})\n\`Player\`: ${player
                        .map((card) => card.name)
                        .join(", ")} (${pt})\n\n${
                        pt == dt
                            ? `You drew and will receive ${bet} ${exorcium} back.`
                            : win
                            ? `You won and will receive ${amount} ${exorcium}`
                            : "You lost!"
                    }`,
                    color: pt == dt ? "GOLD" : win ? "GREEN" : "RED",
                });
            }
        } catch (error) {
            console.error(error.stack || error);

            await transfer("casino", cmd.user.id, bet);

            await cmd.followUpEmbed({
                title: "Challenge Failed!",
                description:
                    "An unexpected error occurred and your bet has been refunded.",
                color: "PURPLE",
            });
        }
    },
});

function blackjack(hand) {
    return (
        hand.some((card) => card.name == "A♠️") &&
        hand.some((card) => card.name == "J♠️" || card.name == "J♣️")
    );
}

function hand_total(hand) {
    var total = 0;

    for (const card of hand) {
        if (card.value != 0) {
            total += card.value;
        }
    }

    for (const card of hand) {
        if (card.value == 0) {
            total += total <= 10 ? 11 : 1;
        }
    }

    return total;
}
