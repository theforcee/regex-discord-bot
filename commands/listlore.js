import { EmbedBuilder } from 'discord.js';
import { QuickDB } from "quick.db";
const db = new QuickDB();

export const commandObj = {
  name: 'listlore',
  description: 'Xem danh sách lore hiện có',
  usage: 'listlore',
  category: 'Utility',
  guildOnly: true,
  async execute(message, args) {

    await db.get("loreList").then(list => {
      if (list.length < 1) return message.channel.send("Chưa có lore nào!");

      let indexs = list.map((item, index) => index).join('\n');

      let searchs = list.map(item => item.search).join('\n');

      let catures = list.map(item => item.capture ? 'yes' : 'no').join('\n');

      let loreEmbed = new EmbedBuilder()
        .setTitle("Danh sách lore hiện có")
        .setColor('Green')
        .addFields({ name: 'Index', value: indexs, inline: true })
        .addFields({ name: 'Search', value: searchs, inline: true })
        .addFields({ name: 'Has Capture', value: catures, inline: true })

      message.channel.send({ embeds: [loreEmbed] })
    }).catch(error => {
      message.channel.send('Fail to get lore list: ', error)
    })

  }
}