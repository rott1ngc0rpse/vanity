const { SlashCommandBuilder, CommandInteraction, Message } = require('discord.js');

const command = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flips a coin'),
    category: 'Fun',
    cooldown: 3,
    enabled: true,
    async execute(interaction) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        await interaction.reply(`The coin landed on: ${result}! 🪙`);
    },
    async executeMessage(message, args) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        await message.reply(`The coin landed on: ${result}! 🪙`);
    }
};

module.exports = command;
