import { EmbedBuilder } from 'discord.js';
import figlet from "figlet";

export const commandObj = {
  name: 'ascii',
  description: 'Chuyển đổi text thành mã ascii',
  usage: 'ascii <text>',
  category: 'Fun',
  guildOnly: true,
  async execute(message, args) {
    let noArgsEmbed = new EmbedBuilder()
      .setColor('Red')
      .setDescription("Please provide some text")
      .setAuthor({
        name: `${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })

    if (!args[0]) return message.channel.send({ embeds: [noArgsEmbed] });

    let msg = args.join(" ");

    figlet.text(msg, function (err, data) {
      if (err) {
        console.log('Something went wrong');
        console.dir(err);
      }
      if (data.length > 2000) return message.channel.send('Text tối đa 2000 ký tự')

      message.channel.send('```' + data + '```')
    })
  }
}