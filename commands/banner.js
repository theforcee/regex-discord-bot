export const commandObj = {
  name: 'banner',
  description: 'Xem banner user',
  usage: 'banner <mention>',
  category: 'Utility',
  guildOnly: true,
  async execute(message, args) {
    if (args.length > 1) return message.channel.send('Xem từng thằng một thôi! <:ngr:421524933781356546>');
    if (!args[0]) return message.channel.send('Muốn xem banner của ai thì tag vào <:ngr:421524933781356546>');

    if (args[0]) {
      let member = message.mentions.members.first();

      if (member) {
        if (!member?.user?.banner) {
          return message.channel.send(`Banner not found`);
        }
        const bannerUri = `https://cdn.discordapp.com/banners/${member.user.id}/${member.user.banner}?size=512`
        message.channel.send(bannerUri);
      } else {
        message.channel.send(`Không tìm thấy thằng ngu này`);
      }
    }
  }
}
