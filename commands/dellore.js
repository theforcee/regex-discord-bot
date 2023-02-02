import { PermissionFlagsBits } from "discord.js";
import { QuickDB } from "quick.db";
import { PREFIX } from "../constant.js";
const db = new QuickDB();

export const commandObj = {
  name: 'dellore',
  description: 'Xoá lore',
  usage: 'dellore <index>',
  category: 'Moderation',
  required: PermissionFlagsBits.ManageRoles,
  guildOnly: true,
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return message.reply("Có cái tuổi loz đòi xoá lore <:ngr:421524933781356546>")

    let index = args[0];

    if (!args || isNaN(index)) return message.reply(`Nhập index cho cẩn thận\n Đã xoá không thể undo <:doge:428416714946904074>\n**${PREFIX}dellore <index>**`)

    db.get("loreList").then(list => {
      if (list.length > index) {
        let lore = list[index];
        list.splice(index, 1);
        db.set("loreList", list);
        return message.channel.send(`Xoá lore **[${index}]: ${lore.search}** thành công`);
      }
      return message.channel.send(`Index **${index}** không đúng`);
    })

  }
}