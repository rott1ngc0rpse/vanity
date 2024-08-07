const { Client, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const { commandHandler } = require('./handlers/commandHandler');
const { eventHandler } = require('./handlers/eventHandler');
const { messageCommandHandler } = require('./handlers/messageCommandHandler');

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize the commands collection
client.commands = new Collection();

// Set up command, event, and message command handlers
commandHandler(client);
eventHandler(client);
messageCommandHandler(client);

// Log in to Discord
client.login(process.env.TOKEN);
