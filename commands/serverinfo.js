import { ChannelType, EmbedBuilder } from 'discord.js';

export const commandObj = {
  name: 'serverinfo',
  description: 'Know the Server Info',
  usage: 'serverinfo',
  category: 'Utility',
  async execute(message, args) {
    let owner = await message.guild.fetchOwner()
    let members = await message.guild.members.fetch({ withPresences: true })

    let defaulEmbed = new EmbedBuilder()
      .setColor("fffff")
      .setTitle("Server Info")
      .setThumbnail(message.guild.iconURL())
      .setAuthor({
        name: `${message.guild.name}`,
        iconURL: message.guild.iconURL()
      })
      .addFields({ name: "**Guild Owner: **", value: `${owner.user.tag}`, inline: true })
      .addFields({ name: "**Created On: **", value: message.guild.createdAt.toLocaleString(), inline: true })
      .addFields({ name: '-', value: '-', inline: true })
      .addFields({ name: "**Member Count: **", value: `${message.guild.memberCount}`, inline: true })
      .addFields({ name: "**Total Members: **", value: `${members.filter(member => !member.user.bot).size}`, inline: true })
      .addFields({ name: "**Total Bots: **", value: `${members.filter(member => member.user.bot).size}`, inline: true })
      .addFields({ name: "**Total Channels: **", value: `${message.guild.channels.cache.size}`, inline: true })
      .addFields({ name: "**Total Text Channels: **", value: message.guild.channels.cache.filter(ch => ch.type === ChannelType.GuildText).size + '', inline: true })
      .addFields({ name: "**Total Voice Channels: **", value: message.guild.channels.cache.filter(ch => ch.type === ChannelType.GuildVoice).size + '', inline: true })
      .setFooter({
        text: `© ${message.client.user.tag}`,
        iconURL: "https://cdn.discordapp.com/avatars/796748319518097419/6417c8b4c69da903eef8db73e435e5c3.png?size=512",
      })

    let successEmbed = EmbedBuilder.from(defaulEmbed)
      .addFields({ name: "**Roles: **", value: `${message.guild.roles.cache.map(role => role.toString()).join(' ')}`, inline: false })

    message.channel.send({ embeds: [successEmbed] }).catch(err => {
      let failureEmbed = EmbedBuilder.from(defaulEmbed)
        .addFields({ name: "**Roles: **", value: `There are a lot of Roles **I was not able to Show Them**`, inline: false })

      console.log('Fail to get serverinfo: ', err);
      message.channel.send({ embeds: [failureEmbed] });
    })
  }
}
