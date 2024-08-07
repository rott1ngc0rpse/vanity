const { Collection } = require('discord.js');

const cooldowns = new Collection(); // No type parameter

// Set cooldown for a command and user
function setCooldown(commandName, userId, cooldownAmount) {
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(commandName);
  timestamps.set(userId, now + cooldownAmount * 1000);
}

// Check if a user is on cooldown for a command
function checkCooldown(commandName, userId) {
  if (!cooldowns.has(commandName)) {
    return null;
  }

  const timestamps = cooldowns.get(commandName);
  const cooldownEnd = timestamps.get(userId);

  if (!cooldownEnd) return null;

  const now = Date.now();
  const timeLeft = cooldownEnd - now;

  if (timeLeft > 0) {
    return formatTime(timeLeft);
  }

  timestamps.delete(userId);
  return null;
}

// Format the time left into a readable string
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts = [];

  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours % 24 > 0) parts.push(`${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`);
  if (seconds % 60 > 0) parts.push(`${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`);

  return parts.join(', ');
}

module.exports = {
  setCooldown,
  checkCooldown
};
