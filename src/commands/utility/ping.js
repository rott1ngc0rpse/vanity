const { SlashCommandBuilder, CommandInteraction, Message } = require('discord.js');

// Define the command object
const command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  async execute(interaction) {
    await interaction.reply('Pong!');
  },

  async executeMessage(message, args) {
    await message.reply('Pong!');
  },

  cooldown: 3,
  enabled: true,
  developerOnly: false,
  nsfwOnly: false,
  category: 'Utility'
};

module.exports = command;
