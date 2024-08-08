const { CommandInteraction, Message, TextChannel } = require('discord.js');
const config = require('../../config.json');

class userChecker {
  constructor(guild, executor, target) {
    this.guild = guild;
    this.executor = executor;
    this.target = target;
  }
}

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

// Check if a required user parameter is provided
function validateUserParameter() {
  if (this.targets.length === 0) {
    return message.reply('No valid targets provided.');
  }
}

// Check if the user exists
async function validateUserExists(client, userId) {
  try {
    await client.users.fetch(userId);
    return { passed: true };
  } catch {
    return { passed: false, message: 'User not found.' };
  }
}

module.exports = {
  runCommandChecks
};
