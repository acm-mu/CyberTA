/* eslint-disable no-console */
const Discord = require('discord.js');

const client = new Discord.Client();
const officehours = require('./officehours');

client.on('ready', () => {
  console.log('[CyberBot] CyberBot has finished loading, and is enabled!');
});

client.on('message', (message) => {
  // Only listen in bot's channels
  if (process.env.TA_CHANNEL !== message.channel.id
        && process.env.OFFICE_HOURS !== message.channel.id) {
    return;
  }

  const args = message.content.split(' ');
  const cmd = args[0].toLowerCase();
  args.splice(0, 1);

  switch (cmd) {
    case '!ping':
    case 'ping':
      message.reply('Pong!');
      break;
    case 'next':
    case '!next':
      officehours.onNext(message, args);
      break;
    case '!leave':
      officehours.onLeave(message);
      break;
    case '!clear':
      officehours.onClear(message, args);
    case '!queue':
      officehours.onQueue(message);
      break;
    case '!undo':
      officehours.onUndo(message);
      break;
    case '!remove':
      officehours.onRemove(message, args);
      break;
    case '!oof':
      officehours.onOof(message);
      break;
    case '!online':
      officehours.onOnline(message, client);
      break;
    case '!offline':
      officehours.onOffline(message, client);
      break;
    case '!ready':
    case 'ready':
      officehours.onReady(message, args);
      break;
    case '!help':
      officehours.onHelp(message);
      break;
    default:
      break;
  }
});

client.login(process.env.BOT_TOKEN);
