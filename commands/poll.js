import Discord from 'discord.js';

export const commandObj = {
  name: 'poll',
  description: 'Sends a yes or no poll',
  usage: 'poll <question>',
  category: 'Fun',
  guildOnly: true,
  async execute(message, args) {
    if (!args.join(" ")) return message.reply("Please enter a question for the poll!")

    let firstPollEmbed = new Discord.EmbedBuilder()
      .setAuthor({
        name: `${message.author.tag}`,
        iconURL: message.author.avatarURL({
          dynamic: true
        })
      })
      .setDescription("```\n⌛ Preparing a poll...\n```")

    let secondPollEmbed = new Discord.EmbedBuilder()
      .setAuthor({
        name: `${message.author.tag}`,
        iconURL: message.author.avatarURL({
          dynamic: true
        })
      })
      .setColor("Yellow")
      .setDescription(`**Poll Question:** \n \`\`\`yaml\n${args.join(" ")}\n\`\`\``)

    message.channel.send({ embeds: [firstPollEmbed] }).then((message) => {
      message.edit({ embeds: [secondPollEmbed] })
      message.react("✅")
      message.react("❌")
    })
  }
};