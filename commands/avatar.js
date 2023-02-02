export const commandObj = {
  name: 'av',
  description: 'Xem avatar to thật to',
  usage: 'av [mention]',
  category: 'Utility',
  guildOnly: true,
  async execute(message, args) {
    if (args.length > 1) return message.channel.send('Xem từng thằng một thôi! <:ngr:421524933781356546>');
    if (!args[0]) return message.channel.send('Muốn xem avatar của ai thì tag vào <:ngr:421524933781356546>');

    if (args[0]) {
      let member = message.mentions.members.first();

      if (member) {
        message.channel.send(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
      } else {
        message.channel.send(`Không tìm thấy thằng ngu này`);
      }
    }
  }
}
