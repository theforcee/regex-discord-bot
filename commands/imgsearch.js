import axios from 'axios';
import { GOOGLE_CUSTOM_SEARCH_CX, GOOGLE_CUSTOM_SEARCH_TOKEN, PREFIX } from '../constant.js';
import Discord from 'discord.js';

const VALID_PROTOCOLS = new Set(['http:', 'https:']);
const IMAGE_EXTENSION_REGEX = /\.(?:jpe?g|png|gif|webp|bmp|svg|ico|tiff?)($|\?)/i;
const GOOGLE_CUSTOM_SEARCH_URL = 'https://customsearch.googleapis.com/customsearch/v1';
const DEFAULT_ERROR_MESSAGE = 'Tớ đang gặp sự cố khi tìm ảnh, thử lại sau nhé.';

class ImgSearchError extends Error {
  constructor(message, userMessage = DEFAULT_ERROR_MESSAGE) {
    super(message);
    this.name = 'ImgSearchError';
    this.userMessage = userMessage;
  }
}

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

function getGoogleSearchConfig() {
  const apiKey = typeof GOOGLE_CUSTOM_SEARCH_TOKEN === 'string' ? GOOGLE_CUSTOM_SEARCH_TOKEN.trim() : '';
  const cx = typeof GOOGLE_CUSTOM_SEARCH_CX === 'string' ? GOOGLE_CUSTOM_SEARCH_CX.trim() : '';

  if (!apiKey) {
    throw new ImgSearchError(
      'Missing Google Custom Search API key',
      'Bot chưa cấu hình Google Custom Search API key.'
    );
  }

  if (!cx) {
    throw new ImgSearchError(
      'Missing Google Custom Search engine id',
      'Bot chưa cấu hình Google Custom Search Engine ID.'
    );
  }

  return { apiKey, cx };
}

function getGoogleSearchErrorMessage(error) {
  const responseData = error?.response?.data;
  const googleError = responseData?.error;
  const statusCode = error?.response?.status || googleError?.code;
  const googleStatus = googleError?.status;
  const googleMessage = googleError?.message || error?.message || '';

  if (
    statusCode === 403 ||
    googleStatus === 'PERMISSION_DENIED' ||
    googleMessage.includes('does not have the access to Custom Search')
  ) {
    return 'Google đang từ chối Custom Search API key (403). Chủ bot cần kiểm tra GOOGLE_CUSTOM_SEARCH_TOKEN/GOOGLE_TOKEN đúng project đã enable Custom Search API và API restrictions có Custom Search API.';
  }

  if (statusCode === 400) {
    return 'Google Custom Search đang báo cấu hình request không hợp lệ. Chủ bot cần kiểm tra GOOGLE_CUSTOM_SEARCH_CX.';
  }

  return DEFAULT_ERROR_MESSAGE;
}

async function requestGoogleAPI(rawQuery = '') {
  const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
  if (!query) {
    return null;
  }

  try {
    const { apiKey, cx } = getGoogleSearchConfig();
    const params = {
      cx,
      searchType: 'image',
      safe: 'off',
      num: 10,
      q: query,
      key: apiKey,
    };
    const requestUrl = new URL(GOOGLE_CUSTOM_SEARCH_URL);
    requestUrl.search = new URLSearchParams(params).toString();
    // console.log('[requestGoogleAPI] request url:', requestUrl.toString());

    const { data } = await axios.get(GOOGLE_CUSTOM_SEARCH_URL, { params });

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
    if (error instanceof ImgSearchError) {
      console.log('ERR requestGoogleAPI:', error.message);
      throw error;
    }

    const googleError = error?.response?.data?.error;
    console.log('ERR requestGoogleAPI:', googleError || error);
    throw new ImgSearchError(
      googleError?.message || error?.message || 'Google Custom Search request failed',
      getGoogleSearchErrorMessage(error)
    );
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
      return message.channel.send(`"${PREFIX}img <keywords>" trả về kết quả đầu tiên khi search trên Google <:doge:428416714946904074> `);
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
      message.channel.send(err?.userMessage || DEFAULT_ERROR_MESSAGE);
    }
  }
}
