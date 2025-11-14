import { PermissionFlagsBits } from "discord.js";
import { PREFIX } from "../constant.js";
import Lore from '../models/Lore.js';

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

    try {
      const list = await Lore.find({}, { search: 1 })
        .sort({ createdAt: 1 })
        .lean();

      if (list.length > index) {
        const lore = list[index];
        await Lore.deleteOne({ _id: lore._id });
        return message.channel.send(`Xoá lore **[${index}]: ${lore.search}** thành công`);
      }
      return message.channel.send(`Index **${index}** không đúng`);
    } catch (error) {
      console.log('dellore error:', error);
      return message.channel.send('Không thể xoá lore, thử lại sau!');
    }
  }
}