const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { runCommandChecks } = require('../../utils/commandChecks');
const PermissionChecker = require('../../utils/permissionChecks');

const command = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for banning the user')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)),

  async execute(interaction) {
    const checkResult = runCommandChecks(this, interaction);
    if (!checkResult.passed) {
      return interaction.reply({ content: checkResult.message, ephemeral: true });
    }

    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 7;

    try {
      const result = await this.banUser(interaction, target, reason, days);
      await interaction.reply(result);
    } catch (error) {
      await interaction.reply({ content: error.message, ephemeral: true });
    }
  },

  async executeMessage(message, args) {
    const checkResult = runCommandChecks(this, message);
    if (!checkResult.passed) {
      return message.reply(checkResult.message);
    }

    if (!args.length) {
      return message.reply('Please mention a user to ban.');
    }

    const target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
    if (!target) {
      return message.reply('Unable to find the specified user.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';
    const days = 0; // Default to 0 for message commands, or you could parse it from args if needed

    try {
      const result = await this.banUser(message, target, reason, days);
      await message.reply(result);
    } catch (error) {
      await message.reply(error.message);
    }
  },

  async banUser(context, target, reason, days) {
    const guild = context.guild;
    const executor = context.member;
    const member = await guild.members.fetch(target.id).catch(() => null);

    const permChecker = new PermissionChecker(guild, executor, member, 'ban');
    const canBan = await permChecker.check();

    if (!canBan) {
      throw new Error(`Cannot ban this user: ${permChecker.getError()}`);
    }

    try {
      await guild.members.ban.bulkCreate([target], { reason: reason, deleteMessageDays: days });
      return `Successfully banned ${target.tag} for reason: ${reason}. Deleted ${days} days of messages.`;
    } catch (error) {
      throw new Error(`Failed to ban ${target.tag}: ${error.message}`);
    }
  },

  cooldown: 5,
  enabled: true,
  developerOnly: false,
  nsfwOnly: false,
  category: 'Moderation',
  permissions: [PermissionFlagsBits.BanMembers]
};

module.exports = command;