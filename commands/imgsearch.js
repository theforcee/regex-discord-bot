import axios from 'axios';
import { GOOGLE_TOKEN, PREFIX } from '../constant.js';
import Discord from 'discord.js';
import { searchconsole } from 'googleapis/build/src/apis/searchconsole/index.js';

new Discord.MessagePayload(searchconsole);

async function requestGoogleAPI(query = '') {
  try {
    if (!query || query === '') {
      return false
    }
    let [cx, safe, searchType] = ['9c4705166f56773e8', 'off', 'image'];
    let resultGoogleAPI = await axios.get(encodeURI(`https://customsearch.googleapis.com/customsearch/v1?cx=${cx}&searchType=${searchType}&q=${query}&key=${GOOGLE_TOKEN}`))
    if (
      resultGoogleAPI.data &&
      resultGoogleAPI.data.items &&
      resultGoogleAPI.data.items[0].title &&
      Array.isArray(resultGoogleAPI.data.items)

    ) {

      return {
        title: resultGoogleAPI.data.items[0].title,
        link: resultGoogleAPI.data.items[0].link,
      }
    }
    else {
      return false;
    }
  }
  catch (error) {
    console.log(error);
  }
}

export const commandObj = {
  name: 'img',
  description: 'Image search',
  usage: 'img <keywords>',
  category: 'Utility',
  guildOnly: true,
  async execute(message, args) {
    if (!args[0]) return message.channel.send(`"${PREFIX}yt <keywords>" trả về kết quả đầu tiên khi search trên Google <:doge:428416714946904074> `);

    let search = args.slice(0).join(' ');

    try {
      let resultImage = await requestGoogleAPI(search.trim());
      if (resultImage) {
        let { title, link } = resultImage;
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
      }
    } catch (err) {
      console.log("ERR request: ", err)
    }
  }
}
