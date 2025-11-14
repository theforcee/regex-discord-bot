import { EmbedBuilder } from 'discord.js';
import Lore from '../models/Lore.js';

const CHUNK_SIZE = 30;

function formatLoreRow(item, index) {
  const idx = index.toString().padStart(2, '0');
  const captureIcon = item.capture ? '📷' : '—';
  return `\`${idx}\` ${item.search} • ${captureIcon}`;
}

function chunkList(list, size = CHUNK_SIZE) {
  const chunks = [];
  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size));
  }
  return chunks;
}

export const commandObj = {
  name: 'listlore',
  description: 'Xem danh sách lore hiện có',
  usage: 'listlore',
  category: 'Utility',
  guildOnly: true,
  async execute(message) {
    try {
      const list = await Lore.find({}, { search: 1, capture: 1 })
        .sort({ createdAt: 1 })
        .lean();

      if (list.length < 1) return message.channel.send("Chưa có lore nào!");

      const rows = list.map(formatLoreRow);
      const chunks = chunkList(rows);

      for (let i = 0; i < chunks.length; i++) {
        const embed = new EmbedBuilder()
          .setTitle("Danh sách lore hiện có")
          .setColor('Green')
          .setDescription(chunks[i].join('\n'))
          .setFooter({ text: `Trang ${i + 1}/${chunks.length} • Tổng: ${list.length}` });

        await message.channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.log('listlore error:', error);
      message.channel.send('Fail to get lore list, thử lại sau!');
    }
  }
}