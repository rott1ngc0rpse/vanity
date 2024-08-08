const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { runCommandChecks } = require('../../utils/commandChecks');
const PermissionChecker = require('../../utils/permissionChecks');

const command = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks one or more users from the server')
    .addStringOption(option =>
      option.setName('targets')
        .setDescription('The users to kick (mention or ID, separated by spaces)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for kicking the users')
        .setRequired(false)),

  async execute(interaction) {
    const checkResult = runCommandChecks(this, interaction);
    if (!checkResult.passed) {
      return interaction.reply({ content: checkResult.message, ephemeral: true });
    }

    const targetsString = interaction.options.getString('targets');
    const targets = targetsString.match(/\d{17,19}/g) || [];
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (targets.length === 0) {
      return interaction.reply({ content: 'No valid user IDs provided.', ephemeral: true });
    }

    try {
      const results = await this.kickUsers(interaction, targets, reason);
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
      return message.reply('Please provide at least one user to kick.');
    }

    const targets = message.mentions.users.map(u => u.id).concat(args.filter(arg => /^\d{17,19}$/.test(arg)));
    const reason = args.filter(arg => !/^\d{17,19}$/.test(arg) && !message.mentions.users.some(u => u.toString() === arg)).join(' ') || 'No reason provided';

    if (targets.length === 0) {
      return message.reply('No valid targets provided.');
    }

    try {
      const results = await this.kickUsers(message, targets, reason);
      await message.reply({ embeds: [this.formatResults(results)] });
    } catch (error) {
      await message.reply(error.message);
    }
  },

  async kickUsers(context, targets, reason) {
    const guild = context.guild;
    const executor = context.member;
    const results = { successful: [], failed: [] };

    for (const targetId of targets) {
      try {
        const member = await guild.members.fetch(targetId);

        const permChecker = new PermissionChecker(guild, executor, member, 'kick');
        const canKick = await permChecker.check();

        if (!canKick) {
          results.failed.push({ user: member.user, reason: permChecker.getError() });
          continue;
        }

        await member.kick(reason);
        results.successful.push(member.user);
      } catch (error) {
        results.failed.push({ user: { id: targetId }, reason: error.message });
      }
    }

    return results;
  },

  formatResults(results) {
    const embed = new EmbedBuilder()
      .setTitle('Kick Results')
      .setColor(0x00ff00);

    if (results.successful.length > 0) {
      embed.addFields({ name: 'Successfully Kicked:', value: results.successful.map(u => u.tag || u.id).join(', ') });
    }

    if (results.failed.length > 0) {
      embed.addFields({ name: 'Failed to Kick:', value: results.failed.map(f => `${f.user.tag || f.user.id} (${f.reason})`).join(', ') });
      embed.setColor(0xff0000);
    }

    return embed;
  },

  cooldown: 5,
  enabled: true,
  developerOnly: false,
  nsfwOnly: false,
  category: 'Moderation',
  permissions: [PermissionFlagsBits.KickMembers]
};

module.exports = command;