const { SlashCommandBuilder, CommandInteraction, Message } = require('discord.js');

// Define the command object
const command = {
    data: new SlashCommandBuilder()
        .setName('randomnum')
        .setDescription('Generates a random number between two given numbers')
        .addIntegerOption(option => 
            option.setName('min')
                .setDescription('The minimum number')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('max')
                .setDescription('The maximum number')
                .setRequired(true)),
    async execute(interaction) {
        const min = interaction.options.getInteger('min');
        const max = interaction.options.getInteger('max');
        
        if (min === null || max === null) {
            await interaction.reply('Please provide both minimum and maximum numbers.');
            return;
        }

        const [lower, upper] = [Math.min(min, max), Math.max(min, max)];
        const result = Math.floor(Math.random() * (upper - lower + 1)) + lower;
        
        await interaction.reply(`Random number between ${lower} and ${upper}: ${result}`);
    },
    async executeMessage(message, args) {
        if (args.length !== 2 || !args.every(arg => /^\d+$/.test(arg))) {
            await message.reply('Usage: v!randomnum <integer> <integer>');
            return;
        }

        const [min, max] = args.map(Number);
        const [lower, upper] = [Math.min(min, max), Math.max(min, max)];
        const result = Math.floor(Math.random() * (upper - lower + 1)) + lower;
        
        await message.reply(`Random number between ${lower} and ${upper}: ${result}`);
    },
    cooldown: 3,
    enabled: true,
    developerOnly: false,
    nsfwOnly: false,
    category: 'Fun'
};

module.exports = command;
