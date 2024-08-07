const { Client, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commandHandler = (client) => {
  const commandFolders = fs.readdirSync(path.join(__dirname, '..', 'commands'));

  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(path.join(__dirname, '..', 'commands', folder))
      .filter((file) => file.endsWith('.js')); // Change from '.ts' to '.js'

    for (const file of commandFiles) {
      const command = require(`../commands/${folder}/${file}`);
      client.commands.set(command.data.name, command);
    }
  }
};

module.exports = { commandHandler };
