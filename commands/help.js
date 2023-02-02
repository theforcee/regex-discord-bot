import Discord, { EmbedBuilder } from 'discord.js';
import { PREFIX } from '../constant.js';

export const commandObj = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  category: 'Utility',
  usage: 'help [command]',
  cooldown: 5,
  execute(message, args) {

    let categories = new Discord.Collection()

    if (!args.length) {
      message.client.commands.forEach(command => {
        const category = categories.get(command.category)
        if (category) {
          category.set(command.name, command)
        } else {
          categories.set(command.category, new Discord.Collection().set(command.name, command))
        }
      })

      const lines = categories.map((category, name) => `**${name}**: \n\`${category.map(command => command.name).join('`, `')}\``)

      let noArgEmbed = new EmbedBuilder()
        .setTitle(`${message.client.user.username} Bot Help`)
        .setColor("Yellow")
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .addFields({ name: 'Commands', value: lines.join('\n'), inline: false })
        .setDescription(`Want to know more about a command? \nDo \`${PREFIX}help <command>\` for more info! E.g \`${PREFIX}help av\`\n\n\`\`\`\n[] - Optional\n<> - Required\n\`\`\``)
        .setAuthor({
          name: `${message.author.tag}`,
          iconURL: message.author.avatarURL({
            dynamic: true
          })
        })
        .setFooter({
          text: message.client.user.username,
          iconURL: message.client.user.displayAvatarURL(),
        })

      return message.channel.send({ embeds: [noArgEmbed] })
        .catch(error => {
          console.error(`Could not send help to ${message.author.tag}.\n`, error);
        });
    }

    const name = args[0].toLowerCase();
    const command = message.client.commands.get(name)

    if (!command) {
      return message.reply('that\'s not a valid command!');
    }
    let data = "";
    data += `Name: **${command.name}**`;

    if (command.description) data += `\nDescription: **${command.description}**`
    if (command.usage) data += `\nUsage: \`${PREFIX}${command.usage}\``
    if (command.example) data += `\nExample: **\`${PREFIX}${command.example}\`**`
    if (command.required) data += `\nRequired Permission: **\`${command.required}\`**`

    let helpEmbed = new EmbedBuilder()
      .setTitle(":books: Command Help")
      .setDescription(data)
      .setColor("Yellow")
      .setFooter({
        text: message.client.user.username,
        iconURL: message.client.user.displayAvatarURL(),
      })
    message.channel.send({ embeds: [helpEmbed] })
  },
};