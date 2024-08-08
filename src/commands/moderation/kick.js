const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { runCommandChecks } = require('../../utils/commandChecks');
const PermissionChecker = require('../../utils/permissionChecks');

const command = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user from the server')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for kicking the user')
        .setRequired(false)),

  async execute(interaction) {
    const checkResult = runCommandChecks(this, interaction);
    if (!checkResult.passed) {
      return interaction.reply({ content: checkResult.message, ephemeral: true });
    }

    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      const result = await this.kickUser(interaction, target, reason);
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
      return message.reply('Please mention a user to kick.');
    }

    const target = message.mentions.users.first() || await message.client.users.fetch(args[0]).catch(() => null);
    if (!target) {
      return message.reply('Unable to find the specified user.');
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      const result = await this.kickUser(message, target, reason);
      await message.reply(result);
    } catch (error) {
      await message.reply(error.message);
    }
  },

  async kickUser(context, target, reason) {
    const guild = context.guild;
    const executor = context.member;
    const member = await guild.members.fetch(target.id).catch(() => null);

    const permChecker = new PermissionChecker(guild, executor, member, 'kick');
    const canKick = await permChecker.check();

    if (!canKick) {
      throw new Error(`Cannot kick this user: ${permChecker.getError()}`);
    }

    try {
      await member.kick(reason);
      return `Successfully kicked ${target.tag} for reason: ${reason}`;
    } catch (error) {
      throw new Error(`Failed to kick ${target.tag}: ${error.message}`);
    }
  },

  cooldown: 5,
  enabled: true,
  developerOnly: false,
  nsfwOnly: false,
  category: 'Moderation',
  permissions: [PermissionFlagsBits.KickMembers]
};

module.exports = command;