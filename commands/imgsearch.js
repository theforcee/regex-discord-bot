import axios from 'axios';
import { GOOGLE_TOKEN, PREFIX } from '../constant.js';
import Discord from 'discord.js';

const VALID_PROTOCOLS = new Set(['http:', 'https:']);
const IMAGE_EXTENSION_REGEX = /\.(?:jpe?g|png|gif|webp|bmp|svg|ico|tiff?)($|\?)/i;

function isLikelyImageUrl(url) {
  if (typeof url !== 'string' || url.length === 0) return false;
  try {
    const parsed = new URL(url);
    if (!VALID_PROTOCOLS.has(parsed.protocol)) return false;
  } catch {
    return false;
  }
  return IMAGE_EXTENSION_REGEX.test(url);
}

async function requestGoogleAPI(rawQuery = '') {
  const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
  if (!query) {
    return null;
  }

  try {
    const params = {
      cx: '325ca177d251d4f0a',
      searchType: 'image',
      safe: 'off',
      num: 10,
      q: query,
      key: GOOGLE_TOKEN,
    };
    const requestUrl = new URL('https://customsearch.googleapis.com/customsearch/v1');
    requestUrl.search = new URLSearchParams(params).toString();
    // console.log('[requestGoogleAPI] request url:', requestUrl.toString());

    const { data } = await axios.get('https://customsearch.googleapis.com/customsearch/v1', { params });

    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
      return null;
    }

    const firstItem = data.items[0];
    const fallbackThumbnail = firstItem?.image?.thumbnailLink || null;
    const fallbackTitle = firstItem?.title || firstItem?.snippet || query;

    for (const item of data.items) {
      if (!item) continue;

      const title = item?.title || item?.snippet || query;

      if (isLikelyImageUrl(item?.link)) {
        console.log('[requestGoogleAPI] using item link image:', item.link);
        return { title, link: item.link };
      }
    }

    if (fallbackThumbnail) {
      console.log('[requestGoogleAPI] no image links found, using fallback thumbnail:', fallbackThumbnail);
      return {
        title: fallbackTitle,
        link: fallbackThumbnail,
      };
    }

    return null;
  } catch (error) {
    console.log('ERR requestGoogleAPI:', error?.response?.data || error);
    return null;
  }
}

export const commandObj = {
  name: 'img',
  description: 'Image search',
  usage: 'img <keywords>',
  category: 'Utility',
  guildOnly: true,
  async execute(message, args) {
    if (!args[0]) {
      return message.channel.send(`"${PREFIX}yt <keywords>" trả về kết quả đầu tiên khi search trên Google <:doge:428416714946904074> `);
    }

    const search = args.join(' ');

    try {
      const resultImage = await requestGoogleAPI(search);
      if (resultImage) {
        const { title, link } = resultImage;
        const imgEmbel = new Discord.EmbedBuilder()
          .setImage(link)
          .setDescription(title)
          .setColor(0xff00)
        try {
          message.channel.send({ embeds: [imgEmbel] });
        }
        catch (err) {
          console.log("ERR .img: ", err)
        }
      } else {
        message.channel.send('Không tìm thấy ảnh phù hợp.');
      }
    } catch (err) {
      console.log("ERR request: ", err)
      message.channel.send('Tớ đang gặp sự cố khi tìm ảnh, thử lại sau nhé.');
    }
  }
}
