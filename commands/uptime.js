import { EmbedBuilder } from 'discord.js';

export const commandObj = {
  name: 'uptime',
  description: 'See How much Time the Bot was Online',
  usage: '?uptime',
  category: 'Utility',
  guildOnly: true,
  async execute(message, args, client) {
    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400) || "0";
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600) || "0";
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60) || "0";
    let seconds = Math.floor(totalSeconds % 60);

    if (days === "0") {
      const embed = new EmbedBuilder()
        .setTitle(`Uptime`)
        .addFields({ name: 'Hours', value: `${hours}`, inline: true })
        .addFields({ name: 'Minutes', value: `${minutes}`, inline: true })
        .addFields({ name: 'Seconds', value: `${seconds}`, inline: true })
        .setColor("White")
      message.channel.send({ embeds: [embed] });
    } else {

      const embed = new EmbedBuilder()
        .setTitle(`Uptime`)
        .addFields({ name: 'Days', value: `${days}`, inline: true })
        .addFields({ name: 'Hours', value: `${hours}`, inline: true })
        .addFields({ name: 'Minutes', value: `${minutes}`, inline: true })
        .addFields({ name: 'Seconds', value: `${seconds}`, inline: true })
        .setColor("White")
      message.channel.send({ embeds: [embed] });
    }
  }
}
