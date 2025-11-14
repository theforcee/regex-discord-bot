import { PermissionFlagsBits } from "discord.js";
import { PREFIX } from '../constant.js';
import Lore from '../models/Lore.js';

export const commandObj = {
  name: 'addlore',
  description: 'Thêm lore để cùng giày xéo',
  usage: 'addlore <keyword> ; <lore> ; [capture url]',
  category: 'Moderation',
  guildOnly: true,
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) return message.reply("Có cái tuổi loz đòi add lore <:ngr:421524933781356546>")

    let temp = message.content.replace(`${PREFIX}addlore`, "").split(';');

    // sai cú pháp
    if (!temp[0] || !temp[1]) {
      return message.channel.send(`Thêm đúng cú pháp dùm <:ngr:421524933781356546>\n**${PREFIX}addlore <keyword> ; <lore> ; [capture]** \n [capture] là link ảnh`);
    }

    try {
      const search = temp[0].toLowerCase().trim();
      const loreText = temp[1].trim();
      const capture = temp[2] ? temp[2].trim() : null;

      const existing = await Lore.findOne({ search });
      if (existing) {
        return message.reply(`keyword **${search}** đã tồn tại`);
      }

      await Lore.create({ search, lore: loreText, capture });
      return message.channel.send(`Thêm lore **${search}** thành công`);
    } catch (error) {
      console.log('addlore error:', error);
      return message.channel.send('Không thể thêm lore, thử lại sau!');
    }
  }
}