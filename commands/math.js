import { EmbedBuilder } from 'discord.js';
import * as math from 'mathjs';
import { PREFIX } from '../constant.js';

export const commandObj = {
  name: 'math',
  description: 'Solve your Math Sums',
  usage: 'math <equation> || Eg: math 1+1 | 1*4 | 34-23*4/2',
  category: 'Utility',
  guildOnly: true,
  async execute(message, args) {
    try {
      if (!args[0]) return message.channel.send("Please Give Me Equation!");
      const equation = message.content.slice(PREFIX.length + 4)

      const embed = new EmbedBuilder()
        .setColor("Green")
        .addFields({ name: 'Operation', value: `\`\`\`yaml\n${equation}\`\`\``, inline: false })
        .addFields({ name: 'Answer', value: `\`\`\`yaml\n${math.evaluate(equation)}\`\`\``, inline: false })
        .setFooter({
          text: message.guild.name,
          iconURL: message.guild.iconURL(),
        })
        .setTimestamp()
        .setAuthor({
          name: 'Calculator',
          iconURL: 'https://cdn.discordapp.com/avatars/786437005021413376/275b8ecf47ea65128e18c2ae0fffc1a2.webp?size=4096'
        });
      message.channel.send({ embeds: [embed] });
    } catch (error) {
      message.channel.send(`Please Give Me Valid Equation | Try Again Later!`).then(() => console.log(error));
    }
  }
}
