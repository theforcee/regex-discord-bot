import fetch from 'axios'
import { CLIENT_TOKEN } from '../constant.js';

export const commandObj = {
  name: 'avm',
  description: 'Xem avatar member trong server',
  usage: 'avm <mention>',
  category: 'Utility',
  guildOnly: true,
  async execute(message, args) {
    if (args.length > 1) return message.channel.send('Xem từng thằng một thôi! <:ngr:421524933781356546>');
    if (!args[0]) return message.channel.send('Muốn xem avatar của ai thì tag vào <:ngr:421524933781356546>');

    if (args[0]) {
      let member = message.mentions.members.first();

      if (member) {
        try {
          let res = await fetch.get(`https://discord.com/api/guilds/${member.guild.id}/members/${member.user.id}`, {
            headers: {
              Authorization: `Bot ${CLIENT_TOKEN}`
            }
          });

          let memberAvatar = res.data.avatar;

          if (memberAvatar !== undefined && memberAvatar !== null) {
            let url = `https://cdn.discordapp.com/guilds/${member.guild.id}/users/${member.user.id}/avatars/${memberAvatar}.webp?size=256`;
            message.channel.send(' ', { files: [url] });
          } else {
            message.channel.send(member.user.displayAvatarURL({ dynamic: true, size: 256 }) + ' ');
          }
        } catch (err) {
          console.log(err.message);
        }

      } else {
        message.channel.send(`Không tìm thấy thằng ngu này`);
      }
    }
  }
}
