const { Client, ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user?.tag}`);

    // Function to update the bot's status
    const updateStatus = () => {
      const statuses = [
        { type: ActivityType.Watching, message: `${client.guilds.cache.size} servers` },
        { type: ActivityType.Playing, message: 'with VS Code' },
        { type: ActivityType.Listening, message: `${client.users.cache.size} users` }
      ];

      const status = statuses[Math.floor(Math.random() * statuses.length)];

      client.user?.setActivity(status.message, { type: status.type });
    };

    // Update status immediately and then every 15 seconds
    setInterval(updateStatus, 15 * 1000);
  },
};
