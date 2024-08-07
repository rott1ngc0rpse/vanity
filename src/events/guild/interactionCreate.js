const { Interaction, Client, Collection } = require('discord.js');
// const { Command } = require('../../interfaces/Command'); // Not needed in JavaScript
const { checkCooldown, setCooldown } = require('../../utils/cooldownManager');
const { runCommandChecks } = require('../../utils/commandChecks');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    // Run command checks
    const checkResult = runCommandChecks(command, interaction);
    if (!checkResult.passed) {
      return interaction.reply({ content: checkResult.message, ephemeral: true });
    }

    // Check cooldown
    const cooldownTime = checkCooldown(command.data.name, interaction.user.id);
    if (cooldownTime) {
      return interaction.reply({ 
        content: `Please wait ${cooldownTime} before reusing the \`${command.data.name}\` command.`, 
        ephemeral: true 
      });
    }

    try {
      await command.execute(interaction);
      // Set cooldown after successful execution
      if (command.cooldown) {
        setCooldown(command.data.name, interaction.user.id, command.cooldown);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
