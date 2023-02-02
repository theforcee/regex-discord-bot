import axios from 'axios';
import Discord from 'discord.js';
import { searchconsole } from 'googleapis/build/src/apis/searchconsole/index.js';
import { GOOGLE_TOKEN, PREFIX } from '../constant.js';

new Discord.MessagePayload(searchconsole);

async function requestYoutubeAPI(query = '') {
  try {
    if (!query || query === '') return false;

    let resultYoutubeAPI = await axios.get(encodeURI(`https://youtube.googleapis.com/youtube/v3/search?q='${query}'&maxResults=10&key=${GOOGLE_TOKEN}`))

    if (
      resultYoutubeAPI.data &&
      resultYoutubeAPI.data.items &&
      Array.isArray(resultYoutubeAPI.data.items) &&
      resultYoutubeAPI.data.items.length > 0
    ) {
      let [hasFoundFirstVideo, embedId] = [false, ''];

      resultYoutubeAPI.data.items.forEach(item => {
        if (!hasFoundFirstVideo && item.id && item.id.kind && item.id.kind === 'youtube#video') {
          hasFoundFirstVideo = true;
          embedId = item.id.videoId;
        }
      })
      return hasFoundFirstVideo ? embedId : false;
    }
    return false;
  }
  catch (error) {
    console.log(error);
  }
}

export const commandObj = {
  name: 'yt',
  description: 'Youtube search',
  usage: 'yt <keywords>',
  category: 'Utility',
  guildOnly: true,
  async execute(message, args) {
    if (!args[0]) return message.channel.send(`"${PREFIX}yt <keywords>" trả về kết quả đầu tiên khi search trên Youtube <:doge:428416714946904074> `);

    let search = args.slice(0).join(' ');

    let embedId = await requestYoutubeAPI(search.trim());
    if (embedId)
      message.channel.send(`https://www.youtube.com/watch?v=${embedId}`)
  }
}
