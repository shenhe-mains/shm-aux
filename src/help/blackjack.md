---
color: d9e9f9
footer: Number cards are worth their value. J, Q, K are worth 10. The Ace is worth 11 unless that would cause a bust, in which case it is worth 1.
---

# Blackjack

Blackjack is a card game played by one or multiple players against a dealer. The blackjack game available here is just one player playing against the dealer, which is the bot. To play, run `/blackjack <amount to bet>`. The objective is to have a higher hand total than the dealer, but if you go over 21, you lose immediately.

To begin, the player and the dealer receive two cards at random. If either player gets a blackjack (Ace of Spades + Jack of Spades/Clubs), they immediately win. If both sides get 21 or both sides go over 21, they draw. Otherwise, if one person gets 21, they win, and if one person goes over 21, the other person wins.

If the game doesn't end immediately, you will be prompted to take actions. You can **hit** (take another card), **double down** (double your current bet and take another card), **forfeit** (end the game immediately and receive half of your current bet back), or **stand** (accept your current hand and proceed to let the dealer act). If you take too long (5 minutes), you will automatically **forfeit**, and if you reach a hand of 21, you automatically **stand**. If you go over 21, you immediately lose.

If the game proceeds past this point, the dealer will keep drawing cards until they hit at least 17. If they go over 21, you automatically win. Otherwise, the person with a higher score wins (or if both are equal, they draw).

If you win, you get 150% of your bet. If you get a blackjack, you win 3x your bet. If you lose, you lose your entire bet. If you draw, your bet is returned to you.
