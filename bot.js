/* eslint-disable no-console */
const dotenv = require('dotenv');

if (!('BOT_TOKEN' in process.env)) dotenv.config();
const { TA_CHANNEL, OFFICE_HOURS, BOT_TOKEN } = process.env;

const Discord = require('discord.js');
const officehours = require('./officehours');

const client = new Discord.Client();

client.on('ready', () => console.log('[CyberTA] Discord bot has finished loading, and is enabled!'));

client.on('message', (message) => {
  if (![TA_CHANNEL, OFFICE_HOURS].includes(message.channel.id)) return;

  const [cmd, ...args] = message.content.toLowerCase().split(' ');

  if (cmd in officehours.cmds) officehours.cmds[cmd].call(this, message, args);
});

client.login(BOT_TOKEN);
