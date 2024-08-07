const { SlashCommandBuilder, CommandInteraction, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

// Define the command object
const command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of available commands'),
    category: 'Utility',
    cooldown: 5,
    enabled: true,
    async execute(interaction) {
        await sendHelpEmbed(interaction);
    },
    async executeMessage(message, args) {
        await sendHelpEmbed(message);
    }
};

// Function to send the help embed
async function sendHelpEmbed(context) {
    const commands = context.client.commands;
    const categories = new Map();

    commands.forEach((cmd) => {
        const category = cmd.category || 'Miscellaneous';
        if (!categories.has(category)) {
            categories.set(category, []);
        }
        categories.get(category).push(cmd);
    });

    const categoryNames = Array.from(categories.keys());
    const pages = [];

    for (let i = 0; i < categoryNames.length; i += 4) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Command List')
            .setDescription('Use `/help <command>` for more info on a command.')
            .setFooter({ text: `Page ${pages.length + 1}/${Math.ceil(categoryNames.length / 4)}` });

        const pageCategories = categoryNames.slice(i, i + 4);
        pageCategories.forEach(category => {
            const categoryCommands = categories.get(category);
            embed.addFields({
                name: category,
                value: categoryCommands.map(cmd => `\`${cmd.data.name}\``).join(', ') || 'N/A'
            });
        });

        pages.push(embed);
    }

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
        );

    let currentPage = 0;

    const reply = await (context instanceof Message 
        ? context.reply({ embeds: [pages[currentPage]], components: [row] }) 
        : context.reply({ embeds: [pages[currentPage]], components: [row], fetchReply: true })
    );

    const message = context instanceof Message 
        ? await context.channel.messages.fetch(reply.id) 
        : await context.fetchReply();

    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

    collector.on('collect', async i => {
        if (i.user.id !== (context instanceof Message ? context.author.id : context.user.id)) {
            return i.reply({ content: 'You cannot use these buttons.', ephemeral: true });
        }

        await i.deferUpdate();

        if (i.customId === 'prev') {
            currentPage = (currentPage - 1 + pages.length) % pages.length;
        } else if (i.customId === 'next') {
            currentPage = (currentPage + 1) % pages.length;
        }

        await message.edit({ embeds: [pages[currentPage]], components: [row] });
    });

    collector.on('end', () => {
        message.edit({ components: [] });
    });
}

module.exports = command;
