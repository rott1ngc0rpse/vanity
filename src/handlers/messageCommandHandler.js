const { Message, Client, Collection } = require('discord.js');
const config = require('../../config.json');
const { checkCooldown, setCooldown } = require('../utils/cooldownManager');
const { runCommandChecks } = require('../utils/commandChecks');

// Function to handle messages and execute commands
const messageCommandHandler = (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
        if (!message.content.startsWith(config.prefix)) return;

        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (!commandName) return;

        const command = client.commands.get(commandName);

        if (!command || !command.executeMessage) return;

        // Run command checks
        const checkResult = runCommandChecks(command, message);
        if (!checkResult.passed) {
            return message.reply(checkResult.message || 'You cannot use this command.');
        }

        // Check cooldown
        const cooldownTime = checkCooldown(command.data.name, message.author.id);
        if (cooldownTime) {
            return message.reply(`Please wait ${cooldownTime} before reusing the \`${command.data.name}\` command.`);
        }

        try {
            await command.executeMessage(message, args);
            // Set cooldown after successful execution
            if (command.cooldown) {
                setCooldown(command.data.name, message.author.id, command.cooldown);
            }
        } catch (error) {
            console.error(error);
            await message.reply('There was an error while executing this command!');
        }
    });
};

module.exports = { messageCommandHandler };
