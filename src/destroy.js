import client from "./client.js";
import config from "./config.js";

client.on("ready", async () => {
    const guild = await client.guilds.fetch(config.guild_id);
    const commands = await guild.commands.fetch();

    for (const id of commands.keys()) {
        console.log(`Destroying command with ID ${id}.`);
        await guild.commands.delete(id);
    }

    client.destroy();
    process.exit();
});

client.run(config.discord_token);
