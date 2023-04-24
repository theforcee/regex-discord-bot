import chalk from 'chalk';
import Discord, { ActivityType, Events, GatewayIntentBits, PermissionFlagsBits } from 'discord.js';
import { readdirSync } from 'fs';
import { QuickDB } from "quick.db";
import { CLIENT_TOKEN, DEV_ID, initLogs, initLore, JOIN_CHANNEL_ID, LEAVE_CHANNEL_ID, OWNER_ID, PREFIX } from './constant.js';
import { keepAlive } from './server.js';
import { getCammom } from './utils.js';

const database = new QuickDB();
const FORBIDDEN_ROLE_ID = '430576964999577600'; // Role Hố
const { Client, Collection } = Discord;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ]
});

const commandFiles = readdirSync('./commands')
  .filter(file => file.endsWith('.js'));

client.commands = new Collection();
for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.commandObj.name, command.commandObj);
}

client.once(Events.ClientReady, () => {
  console.log(
    chalk.bgGreenBright.black('[' + client.user.tag + ']'),
    'Bot Online'
  );
  client.user.setActivity('hadaik', {
    type: ActivityType.Watching
  });
});

client.on(Events.GuildMemberAdd, async member => {
  const Channel = member.guild.channels.cache.get(JOIN_CHANNEL_ID);
  Channel.send(
    `Ối giời ơi con xúc vật **<@${member.user.id
    }>** nó vào kìa <:ah:392281544976236544>`
  );
});

client.on(Events.GuildMemberRemove, async member => {
  const Channel = member.guild.channels.cache.get(LEAVE_CHANNEL_ID);
  Channel.send(
    `Địt mẹ chúng mày, bố mày rage quit, **${member.user.username}#${member.user.discriminator
    }** gào lên rồi cắp đít khỏi clan xúc vật <:sadd:410255234099707906>`
  );
});

// main function
client.on(Events.MessageCreate, async message => {
  // normal chatting => get lore from db
  if (!message.content.startsWith(PREFIX) && message.author.id != OWNER_ID) {
    let content = message.content.toLowerCase();
    try {
      let data = await database.get('loreList');
      if (!data || data.length < 1) {
        database.set('loreList', initLore);
      } else {
        let index = null;
        const baseRegex = `^\\s*loreSearch|.+( loreSearch)`
        data.every((item, i) => {
          const regexForLore = new RegExp(baseRegex.replaceAll('loreSearch', item.search), 'gmi');
          if (regexForLore.test(content)) {
            index = i;
            return false;
          }
          return true;
        });

        if (index !== null) {
          if (!data[index].capture)
            return message.channel.send(data[index].lore);
          return message.channel.send({
            content: data[index].lore,
            files: [data[index].capture]
          });
        } else {
          // special lore
          if (content.includes('bot ngu')) {
            if (message.author.id === DEV_ID)
              return message.reply('Em xin lỗi <:pudency:392281550865039362>');
            return message.reply('Ngu con mẹ bạn <:ngr:421524933781356546>');
          }
          if (content.includes('câm mồm'))
            return message.channel.send(getCammom(message));
        }
      }
    } catch (error) {
      console.log(error);
      message.reply(
        'There was an error trying to get lore! ```\n' + error + '\n```'
      );
    }
  } else {
    // use command
    const args = message.content
      .slice(PREFIX.length)
      .trim()
      .split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
      client.commands.get(commandName)

    if (!command) return;

    if (message.member.roles.cache.has(FORBIDDEN_ROLE_ID))
      return message.reply("Vất xục thì cút <:ngr:421524933781356546>")

    try {
      command.execute(message, args, client);

      // add to log
      database.get('dataLog').then(list => {
        if (!list || list?.length < 1) {
          database.set('dataLog', initLogs);
        } else {
          let now = new Date().toLocaleString('vi-VN', {
            timeZone: 'Asia/Jakarta'
          });
          let newLog = {
            author: message.author.tag,
            command: message.content,
            time: now
          };
          list.push(newLog);
          database.set('dataLog', list).then(() => {
            console.log(
              chalk.greenBright('[COMMAND]'),
              `${now}: ${message.author.tag} used the command ` + commandName
            );
          });
        }
      });
    } catch (error) {
      console.log(error);
      message.reply(
        'there was an error trying to execute that command! ```\n' +
        error +
        '\n```'
      );
    }
  }
});


client.login(CLIENT_TOKEN);
keepAlive();