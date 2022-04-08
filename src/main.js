import client from "./client.js";
import config from "./config.js";

import { start } from "./lib/scheduler.js";

process.on("uncaughtException", (error) => {
    console.error(error.stack || error);
});

client.on("ready", async () => {
    try {
        client.home = await client.guilds.fetch(config.guild_id);
    } catch {
        console.error(`Could not load home guild; ID ${config.guild_id}`);
    }

    start();
    console.log("SHM Economy Bot is ready.");
});

client.run(config.discord_token);
