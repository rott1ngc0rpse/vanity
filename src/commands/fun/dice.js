const { SlashCommandBuilder } = require('discord.js');

// Define the command object
const command = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Rolls a six-sided die'),
    category: 'Fun',
    cooldown: 3,
    enabled: true,
    async execute(interaction) {
        const result = Math.floor(Math.random() * 6) + 1;
        await interaction.reply(`You rolled a ${result}! 🎲`);
    },
    async executeMessage(message, args) {
        const result = Math.floor(Math.random() * 6) + 1;
        await message.reply(`You rolled a ${result}! 🎲`);
    }
};

module.exports = command;
