import { QuickDB } from "quick.db";
import { PREFIX } from './constant.js';

const db = new QuickDB();

module.exports = {
  name: 'addlore',
  description: 'Work and get paid',
  usage: 'addlore <keyword> <lore> [capture]',
  category: 'Moderation',
  guildOnly: true,
  async execute(message, args) {
    if (!message.member.hasPermission("MANAGE_ROLES")) return message.reply("Có cái tuổi loz đòi add lore <:ngr:421524933781356546>")

    let temp = message.content.replace(`${PREFIX}addlore`, "").split(';');

    // sai cú pháp
    if (!temp[0] || !temp[1]) {
      return message.channel.send(`Thêm đúng cú pháp dùm <:ngr:421524933781356546>\n**${PREFIX}addlore <keyword> ; <lore> ; [capture]** \n [capture] là link ảnh`);
    }

    db.get("loreList").then(list => {
      let search = temp[0].toLowerCase().trim();
      // check keyword exists
      let keywords = list.map(item => item.search);
      if (keywords.indexOf(search) !== -1) return message.reply(`keyword **${search}** đã tồn tại`);
      // create new lore
      let newLore = {
        search: search,
        lore: temp[1].trim(),
        capture: temp[2] ? temp[2].trim() : null
      }
      list.push(newLore);
      db.set("loreList", list).then(() => message.channel.send(`Thêm lore **${search}** thành công`));
    })
  }
}