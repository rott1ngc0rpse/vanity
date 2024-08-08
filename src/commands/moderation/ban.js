const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { runCommandChecks } = require('../../utils/commandChecks');
const PermissionChecker = require('../../utils/permissionChecks');

const command = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans one or more users from the server')
    .addStringOption(option =>
      option.setName('targets')
        .setDescription('The users to ban (mention or ID, separated by spaces)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for banning the users')
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

    const targetsString = interaction.options.getString('targets');
    const targets = targetsString.match(/\d{17,19}/g) || [];
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 7;

    if (targets.length === 0) {
      return interaction.reply({ content: 'No valid user IDs provided.', ephemeral: true });
    }

    try {
      const results = await this.banUsers(interaction, targets, reason, days);
      await interaction.reply({ embeds: [this.formatResults(results)] });
    } catch (error) {
      await interaction.reply({ content: error.message, ephemeral: true });
    }
  },

  async executeMessage(message, args) {
    const checkResult = runCommandChecks(this, message);
    if (!checkResult.passed) {
      return message.reply(checkResult.message);
    }

    if (args.length < 1) {
      return message.reply('Please provide at least one user to ban.');
    }

    const targets = message.mentions.users.map(u => u.id).concat(args.filter(arg => /^\d{17,19}$/.test(arg)));
    const reason = args.filter(arg => !/^\d{17,19}$/.test(arg) && !message.mentions.users.some(u => u.toString() === arg)).join(' ') || 'No reason provided';
    const days = 0; // Default to 0 for message commands

    if (targets.length === 0) {
      return message.reply('No valid targets provided.');
    }

    try {
      const results = await this.banUsers(message, targets, reason, days);
      await message.reply({ embeds: [this.formatResults(results)] });
    } catch (error) {
      await message.reply(error.message);
    }
  },

  async banUsers(context, targets, reason, days) {
    const guild = context.guild;
    const executor = context.member;
    const results = { successful: [], failed: [] };

    for (const targetId of targets) {
      try {
        const target = await context.client.users.fetch(targetId);
        const member = await guild.members.fetch(targetId).catch(() => null);

        const permChecker = new PermissionChecker(guild, executor, member, 'ban');
        const canBan = await permChecker.check();

        if (!canBan) {
          results.failed.push({ user: target, reason: permChecker.getError() });
          continue;
        }

        await guild.members.ban(target, { reason: reason, deleteMessageDays: days });
        results.successful.push(target);
      } catch (error) {
        results.failed.push({ user: { id: targetId }, reason: error.message });
      }
    }

    return results;
  },

  formatResults(results) {
    const embed = new EmbedBuilder()
      .setTitle('Ban Results')
      .setColor(0x00ff00);

    if (results.successful.length > 0) {
      embed.addFields({ name: 'Successfully Banned:', value: results.successful.map(u => u.tag || u.id).join(', ') });
    }

    if (results.failed.length > 0) {
      embed.addFields({ name: 'Failed to Ban:', value: results.failed.map(f => `${f.user.tag || f.user.id} (${f.reason})`).join(', ') });
      embed.setColor(0xff0000);
    }

    return embed;
  },

  cooldown: 5,
  enabled: true,
  developerOnly: false,
  nsfwOnly: false,
  category: 'Moderation',
  permissions: [PermissionFlagsBits.BanMembers]
};

module.exports = command;