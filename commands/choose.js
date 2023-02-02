import { PREFIX } from "../constant.js";

export const commandObj = {
  name: 'choose',
  description: 'Chọn 1 trong các options',
  usage: 'choose <keyword> ; <keyword> ...',
  category: 'Utility',
  guildOnly: true,
  async execute(message, args) {

    let temp = message.content.replace(`${PREFIX}choose`, "").split(';');
    let length = temp.length;

    // sai cú pháp
    if (length < 2) {
      return message.reply(`Choose dưới 2 thì choose cái loz à <:ngr:421524933781356546>`);
    }

    let randomIndex = Math.floor(Math.random() * length);

    message.reply(`${temp[randomIndex]} thôi chứ còn chờ gì nữa <:doubt:392281546687643649>`)
  }
}