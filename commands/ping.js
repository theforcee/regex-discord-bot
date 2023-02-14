import { EmbedBuilder } from 'discord.js';

export const commandObj = {
  name: 'ping',
  description: 'Know the Latency of the Bot',
  usage: 'ping',
  category: 'Utility',
  guildOnly: true,

  async execute(message, args) {

    const m = await message.channel.send("Hold on .....")

    let dbb = Math.floor(Math.random() * 10) + 1;

    let pong = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .setColor('Blue')
      // .setTimestamp()
      .addFields({ name: 'Client ping', value: `${message.client.ws.ping}ms`, inline: true })
      .addFields({ name: 'Latency', value: `${m.createdTimestamp - message.createdTimestamp}ms`, inline: true })
      .addFields({ name: 'Database', value: `${dbb}ms`, inline: true })
      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL(),
      });

    m.edit({
      embeds: [pong]
    })
  }
}