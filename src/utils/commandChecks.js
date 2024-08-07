const { CommandInteraction, Message, TextChannel } = require('discord.js');
const config = require('../../config.json');

// Function to run command checks
function runCommandChecks(command, context) {
  // Check if the command is enabled
  if (command.enabled === false) {
    return { passed: false, message: 'This command is currently disabled.' };
  }

  // Check if the command is developer-only
  if (command.developerOnly && !isDeveloper(getUserId(context))) {
    return { passed: false, message: 'This command is only available to developers.' };
  }

  // Check if the command is NSFW-only
  if (command.nsfwOnly && !isNSFWChannel(context.channel)) {
    return { passed: false, message: 'This command can only be used in NSFW channels.' };
  }

  // All checks passed
  return { passed: true };
}

// Helper function to get user ID from either Message or CommandInteraction
function getUserId(context) {
  if (context instanceof Message) {
    return context.author.id;
  } else {
    return context.user.id;
  }
}

// Helper function to check if a user is a developer
function isDeveloper(userId) {
  const developerIds = config.developers;
  return developerIds.includes(userId);
}

// Helper function to check if a channel is NSFW
function isNSFWChannel(channel) {
  return channel instanceof TextChannel && channel.nsfw;
}

module.exports = {
  runCommandChecks
};
