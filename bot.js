/* eslint-disable no-console */
const Discord = require('discord.js');
const dotenv = require('dotenv');
const officehours = require('./officehours');

if ((!('BOT_TOKEN' in process.env))) {
  dotenv.config();
}

const client = new Discord.Client();

client.on('ready', () => {
  console.log('[CyberTA] CyberTA has finished loading, and is enabled!');
});

client.on('message', (message) => {
  if (![process.env.TA_CHANNEL, process.env.OFFICE_HOURS].includes(message.channel.id)) {
    return;
  }

  const [cmd, ...args] = message.content.toLowerCase().split(' ');

  if (cmd in officehours.cmds) {
    officehours.cmds[cmd].call(this, message, args);
  }
});

client.login(process.env.BOT_TOKEN);
