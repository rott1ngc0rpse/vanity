const { SlashCommandBuilder, Message } = require('discord.js');

// Define the command object
const command = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),

  async execute(interaction) {
    sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    interaction.editReply(`Roundtrip latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);

  },

  async executeMessage(message, args) {
    const sent = await message.reply({ content: 'Pinging...', fetchReply: true });
    await sent.edit(`Roundtrip latency: ${sent.createdTimestamp - message.createdTimestamp}ms`);
  },  
  
  cooldown: 3,
  enabled: true,
  developerOnly: false,
  nsfwOnly: false,
  category: 'Utility'
};

module.exports = command;
