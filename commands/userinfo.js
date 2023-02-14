import chalk from 'chalk';
import Discord from 'discord.js';

export const commandObj = {
  name: 'userinfo',
  description: 'Know Others Information',
  usage: 'userinfo [mention]',
  category: 'Utility',
  guildOnly: true,
  async execute(message, args) {
    if (args.length > 1) return message.channel.send('Only mention one user!');
    if (!args[0]) return message.channel.send('Mention someone!');

    if (args[0]) {
      let member = message.mentions.members.first();
      console.log(chalk.bgRed.black('member'), member.presence)

      if (member) {
        let embed = new Discord.EmbedBuilder()
          .setColor("fffff")
          .setTitle("User Info")
          .setThumbnail(member.user.displayAvatarURL())
          .setAuthor({
            name: `${member.user.tag} (${member.id})`,
            iconURL: member.user.displayAvatarURL()
          })
          // .setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
          .addFields({ name: '**Username:**', value: `${member.user.username}`, inline: true })
          .addFields({ name: '**Discriminator:**', value: `${member.user.discriminator}`, inline: true })
          .addFields({ name: '**ID:**', value: `${member.user.id}`, inline: true })
          .addFields({ name: '**Status:**', value: `${member.presence?.status}`, inline: true })
          .addFields({ name: '**Joined On:**', value: `${member.joinedAt.toLocaleString()}`, inline: true })
          .addFields({ name: '**Created On:**', value: `${member.user.createdAt.toLocaleString()}`, inline: true })
          .setDescription(`${member.roles.cache.map(role => role.toString()).join(' ')}`)
          .setFooter({
            text: `© ${message.client.user.tag}`,
            iconURL: "https://cdn.discordapp.com/avatars/796748319518097419/6417c8b4c69da903eef8db73e435e5c3.png?size=512",
          })

        message.channel.send({ embeds: [embed] });
      } else {
        message.channel.send(`Could not find that member`);
      }
    }
  }
}
