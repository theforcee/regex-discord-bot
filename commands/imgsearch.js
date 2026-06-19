import axios from 'axios';
import {
  PREFIX,
  SEARXNG_BASE_URL,
  SEARXNG_IMAGE_ENGINES,
  SEARXNG_LANGUAGE,
  SEARXNG_QUERY_SUFFIX,
} from '../constant.js';
import Discord from 'discord.js';

const VALID_PROTOCOLS = new Set(['http:', 'https:']);
const IMAGE_EXTENSION_REGEX = /\.(?:jpe?g|png|gif|webp|bmp|svg|ico|tiff?)($|\?)/i;
const DEFAULT_ERROR_MESSAGE = 'Tớ đang gặp sự cố khi tìm ảnh, thử lại sau nhé.';
const SEARXNG_SEARCH_PATH = 'search';
const DEFAULT_SEARXNG_TIMEOUT_MS = 10000;

class ImgSearchError extends Error {
  constructor(message, userMessage = DEFAULT_ERROR_MESSAGE) {
    super(message);
    this.name = 'ImgSearchError';
    this.userMessage = userMessage;
  }
}

function isValidHttpUrl(url) {
  if (typeof url !== 'string' || url.length === 0) return false;
  try {
    const parsed = new URL(url);
    return VALID_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

function isLikelyImageUrl(url) {
  if (!isValidHttpUrl(url)) return false;
  return IMAGE_EXTENSION_REGEX.test(url);
}

function getSearxngBaseUrl() {
  const baseUrl = typeof SEARXNG_BASE_URL === 'string' ? SEARXNG_BASE_URL.trim() : '';

  if (!baseUrl) {
    throw new ImgSearchError(
      'Missing SearXNG base URL',
      'Bot chưa cấu hình SearXNG instance URL.'
    );
  }

  try {
    const parsed = new URL(baseUrl);
    if (!VALID_PROTOCOLS.has(parsed.protocol)) {
      throw new Error('Unsupported SearXNG URL protocol');
    }

    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    parsed.search = '';
    parsed.hash = '';

    return parsed.toString().replace(/\/+$/, '');
  } catch {
    throw new ImgSearchError(
      `Invalid SearXNG base URL: ${baseUrl}`,
      'SearXNG instance URL không hợp lệ.'
    );
  }
}

function getSearxngImageEngines() {
  const engines = typeof SEARXNG_IMAGE_ENGINES === 'string' ? SEARXNG_IMAGE_ENGINES.trim() : '';
  return engines || 'google images;bing images,duckduckgo images';
}

function getSearxngEngineGroups() {
  const engineGroups = getSearxngImageEngines()
    .split(';')
    .map((engineGroup) => engineGroup.trim())
    .filter(Boolean);

  return engineGroups.length > 0 ? engineGroups : ['google images', 'bing images,duckduckgo images'];
}

function getSearxngLanguage() {
  const language = typeof SEARXNG_LANGUAGE === 'string' ? SEARXNG_LANGUAGE.trim() : '';
  return language || 'vi-VN';
}

function getSearxngQueryVariants(query) {
  const suffix = typeof SEARXNG_QUERY_SUFFIX === 'string' ? SEARXNG_QUERY_SUFFIX.trim() : '';
  if (!suffix || query.toLocaleLowerCase('vi').includes(suffix.toLocaleLowerCase('vi'))) {
    return [query];
  }

  return [query, `${query} ${suffix}`];
}

function resolveUrl(rawUrl, baseUrl) {
  if (typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
    return null;
  }

  try {
    return new URL(rawUrl.trim(), `${baseUrl}/`).toString();
  } catch {
    return null;
  }
}

function pickImageResult(results, query, baseUrl) {
  for (const item of results) {
    if (!item) continue;

    const title = item?.title || item?.content || query;
    const imageUrl = [
      item?.img_src,
      item?.thumbnail_src,
      item?.thumbnail,
    ]
      .map((url) => resolveUrl(url, baseUrl))
      .find((url) => isValidHttpUrl(url));

    if (imageUrl) {
      console.log('[requestSearxngAPI] using image result:', imageUrl);
      return { title, link: imageUrl };
    }

    const fallbackUrl = resolveUrl(item?.url, baseUrl);
    if (fallbackUrl && isLikelyImageUrl(fallbackUrl)) {
      console.log('[requestSearxngAPI] using fallback image url:', fallbackUrl);
      return { title, link: fallbackUrl };
    }
  }

  return null;
}

function shouldTryNextSearxngEngine(error) {
  const retryableCodes = new Set(['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET']);
  if (retryableCodes.has(error?.code)) return true;

  const statusCode = error?.response?.status;
  return typeof statusCode === 'number' && statusCode >= 500;
}

function getSearxngErrorMessage(error) {
  const statusCode = error?.response?.status;

  if (statusCode === 403) {
    return 'SearXNG instance đang chặn JSON output hoặc image search. Hãy bật `json` trong `search.formats` của settings.yml.';
  }

  if (statusCode === 404) {
    return 'Không tìm thấy endpoint SearXNG. Chủ bot cần kiểm tra SEARXNG_BASE_URL.';
  }

  if (statusCode === 429) {
    return 'SearXNG instance đang bị rate limit, thử lại sau nhé.';
  }

  if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') {
    return 'Không kết nối được tới SearXNG instance.';
  }

  return DEFAULT_ERROR_MESSAGE;
}

async function requestSearxngAPI(rawQuery = '') {
  const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
  if (!query) {
    return null;
  }

  try {
    const baseUrl = getSearxngBaseUrl();
    const requestUrl = new URL(SEARXNG_SEARCH_PATH, `${baseUrl}/`).toString();
    const language = getSearxngLanguage();
    const engineGroups = getSearxngEngineGroups();
    const queryVariants = getSearxngQueryVariants(query);
    let lastRetryableError = null;

    for (const searchQuery of queryVariants) {
      for (const engines of engineGroups) {
        try {
          const params = {
            q: searchQuery,
            engines,
            format: 'json',
            language,
            safesearch: 0,
            pageno: 1,
          };

          const { data } = await axios.get(requestUrl, {
            params,
            headers: { Accept: 'application/json' },
            timeout: DEFAULT_SEARXNG_TIMEOUT_MS,
          });

          if (!data || !Array.isArray(data.results) || data.results.length === 0) {
            console.log('[requestSearxngAPI] no image results from engines:', engines);
            continue;
          }

          const result = pickImageResult(data.results, searchQuery, baseUrl);
          if (result) {
            return result;
          }
        } catch (error) {
          if (!shouldTryNextSearxngEngine(error)) {
            throw error;
          }

          lastRetryableError = error;
          console.log('[requestSearxngAPI] retrying after engine failure:', engines, error?.code || error?.response?.status || error?.message);
        }
      }
    }

    if (lastRetryableError) {
      throw lastRetryableError;
    }

    return null;
  } catch (error) {
    if (error instanceof ImgSearchError) {
      console.log('ERR requestSearxngAPI:', error.message);
      throw error;
    }

    console.log('ERR requestSearxngAPI:', error?.response?.data || error);
    throw new ImgSearchError(
      error?.message || 'SearXNG image search request failed',
      getSearxngErrorMessage(error)
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
      return message.channel.send(`"${PREFIX}img <keywords>" trả về kết quả đầu tiên khi search ảnh bằng SearXNG <:doge:428416714946904074> `);
    }

    const search = args.join(' ');

    try {
      const resultImage = await requestSearxngAPI(search);
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
