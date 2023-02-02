export const commandObj = {
  name: 'roll',
  description: 'Random số từ 0 đến max',
  usage: 'roll <max>',
  category: 'Fun',
  guildOnly: true,
  async execute(message, args) {

    if (!args[0]) {
      message.reply('Max đâu <:ngr:421524933781356546>')

    } else {
      let randNumber = Math.floor(Math.random() * args[0]) + ''
      message.reply(randNumber)
    }
  }
}