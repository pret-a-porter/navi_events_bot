import * as dayjs from 'dayjs';
import * as dotenv from 'dotenv';
import * as express from 'express';
import Telegraf from 'telegraf';

import { createRect, getAddressDetails, getAddressList, getSortedAddressList, getAddressImage } from './helpers';
import { IAddressDetails, IPoint } from './models';

const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');

dotenv.config();
const API_TOKEN = process.env.TOKEN || '';
const PORT = Number(process.env.PORT) || 3000;
const URL = process.env.URL || 'https://floating-peak-52053.herokuapp.com';

if (!API_TOKEN) {
  throw new Error('Token required!');
}

const app = express();
const bot = new Telegraf(API_TOKEN);

if (process.env.NODE_ENV === 'production') {
  bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
  app.use(bot.webhookCallback(`/bot${API_TOKEN}`));
}

bot.start(ctx => ctx.reply('Welcome! I`m NaviEventsBot 🤖 I can find interesting events for you 😊 Send me your location 🌏'));
bot.help(ctx => ctx.reply('I can find interesting events for you 😊 Send me your location 🌏'));
bot.hears('hi', ctx => ctx.reply('What`s up?'));
bot.hears(/buy/i, ctx => ctx.reply('Buy-buy'));

bot.on('message', ctx => {
  const { chat, message } = ctx;

  if (!message || !message.location || !chat) {
    return;
  }

  getNearestEvent({
    lat: message.location.latitude,
    lng: message.location.longitude,
  }).then(details => {
    const keyboard = Markup.inlineKeyboard([
      Markup.urlButton('🌏️ See on naviaddress', `https://staging.naviaddress.com/${details.container}/${encodeURIComponent(details.naviaddress)}`),
    ]);

    const image = getAddressImage(details);

    if (image) {
      bot.telegram.sendPhoto(chat.id, image)
      .then(() => {
        bot.telegram.sendMessage(chat.id, details.name);
      })
      .then(() => {
        bot.telegram.sendMessage(chat.id, `📌 ${details.postal_address}`, Extra.markup(keyboard));
      });
      return;
    }

    bot.telegram.sendMessage(chat.id, details.name)
    .then(() => {
      bot.telegram.sendMessage(chat.id, `📌 ${details.postal_address}`, Extra.markup(keyboard));
    });
  });

  return ctx.reply('Wait please ⏳ I search 🔎');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

async function getNearestEvent(point: IPoint) {
  let delta = 0.1;
  const limit = 100;
  const now = dayjs();
  const addressDetailsList: IAddressDetails[] = [];

  while (addressDetailsList.length === 0) {
    if (delta >= 5) {
      delta += 1;
    } else {
      delta += 0.1;
      delta = Number(delta.toFixed(1));
    }

    const rect = createRect(point, delta);
    let addressList = await getAddressList(rect, limit);
    addressList = getSortedAddressList(point, addressList);

    addressList.forEach(async address => {
      const details = await getAddressDetails(address);

      if (!details.name || !details.postal_address) {
        return;
      }

      if (details.event_end) {
        const eventEnd = dayjs(details.event_end);

        if (eventEnd.diff(now, 'hour') < 0) {
          return;
        }
      }

      addressDetailsList.push(details);
    });
  }

  return addressDetailsList[0];
}
