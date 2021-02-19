/* eslint-disable no-console */
const moment = require('moment');

const ACK = '👍';
const ON = '✔️';
const OFF = '❌';
const NAK = '🛑';
const WARN = '⚠️';

const {
  OFFICE_HOURS,
  TA_CHANNEL,
} = process.env;

const queue = [];
const dequeued = [];
const onlineTas = {};
let offlineCommands = false;

function getNickname(message) {
  const member = message.guild.member(message.author);
  if (member.nickname !== null) {
    return member.nickname;
  }
  return member.user.username;
}

function index(member) {
  for (let i = 0; i < queue.length; i += 1) {
    if (queue[i].member.id === member.id) {
      return i;
    }
  }
  return -1;
}

const isOnline = (member) => member.id in onlineTas;
const contains = (member) => index(member) !== -1;

exports.cmds = {

  /**
   * A check to verify the bot is running, and listening.
   *
   * @param {Object} message - The Discord message object to interact with.
   */
  '!ping': (message) => {
    message.react(ACK);
    message.reply('Pong!');
  },

  /**
   * Users can add themselves to the queue via the !next command.
   * If they are already in the queue it will let them know and
   * quit, otherwise acknowledge.
   *
   * @param {Object} message - The Discord message object to interact with.
   * @param {string[]} args - The words following the command that invoked this function
   * from the discord message.
   */
  '!next': (message, args) => {
    if (message.channel.id !== OFFICE_HOURS) return;

    if (Object.keys(onlineTas).length === 0) {
      message.react(NAK);
      message.reply("Sorry there are no TA's on.");
      return;
    }

    if (contains(message.author)) {
      message.react(NAK);
      message.reply('You are already in the queue.')
        .then((msg) => {
          msg.delete({
            timeout: 5000,
          });
          message.delete({
            timeout: 5000,
          });
        });
      return;
    }

    queue.push({
      member: message.author,
      desc: args.join(' '),
      message,
      timestamp: new Date(),
    });

    message.react(ACK);
    message.reply(`You are now #${queue.length} in the queue.`)
      .then((msg) => {
        msg.delete({
          timeout: 10 * 1000,
        });
      });
  },

  /**
   * If a user needs to leave the queue they can use the !leave command.
   * This will remove them if they are in the queue, otherwise NAK.
   *
   * DEV Note: This potentially could be where the TA-leave functionality goes
   *
   * @param {Object} message - The Discord message object to interact with.
   */
  '!leave': (message) => {
    if (OFFICE_HOURS === message.channel.id) {
      if (!contains(message.author)) {
        message.react(NAK);
        message.delete({
          timeout: 10 * 1000,
        });
        return;
      }

      queue.splice(index(message.author), 1);
      message.react(ACK);
      message.delete({
        timeout: 10 * 1000,
      });
    }
  },

  /**
   * TA's can use this command to empty the queue.
   *
   * @param {Object} message - The Discord message object to interact with.
   */
  '!clear': (message) => {
    if (TA_CHANNEL !== message.channel.id) return;

    if (queue.length === 0) {
      message.react(WARN);
      message.channel.send('```nimrod\nThe queue is currently empty```');
      return;
    }

    /* Goes through entire queue and finds the student's 'next' message and removes it */
    for (let i = queue.length - 1; i >= 0; i -= 1) {
      const msg = queue[i].message;
      msg.delete();
    }

    queue.length = 0;
    if (queue.length === 0) {
      message.channel.send('```nimrod\nThe queue is now empty!```');
    }

    message.react(ACK);
  },

  /**
   * TA's can use the !queue command to view the current items in the queue.
   * Student's can use the !queue command to view how many people are in the queue,
   * and where they are (if they are in the queue).
   *
   * @param {*} message - The Discord message object to interact with.
   */
  '!queue': (message) => {
    if (OFFICE_HOURS === message.channel.id) {
      message.react(ACK);

      if (queue.length === 0) {
        message.channel.send('```nimrod\nThe queue is currently empty```');
        return;
      }

      let body = `\`\`\`nimrod\nThere are currently ${queue.length} people in the queue.`;

      if (contains(message.author)) {
        body += `You are #${index(message.author) + 1}!`;
      }

      message.channel.send(`${body}\`\`\``);
    } else if (TA_CHANNEL === message.channel.id) {
      message.react(ACK);

      if (queue.length === 0) {
        message.channel.send('```nimrod\nThe queue is currently empty```');
        return;
      }

      const body = [];

      for (let i = 0; i < queue.length; i += 1) {
        const { desc, member: { username }, timestamp } = queue[i];
        const waitTime = moment(timestamp).fromNow();

        body.push(`${i}) ${username} "${desc}"\t\t [${waitTime}]`);
      }

      message.channel.send(`\`\`\`nimrod\n${body.join('\n')}\`\`\``);
    }
  },

  /**
   * If a TA accidently readied a student, and needs to put them back in the queue.
   * '!undo' will automatically put the last dequeued member back to the front of the queue.
   *
   * If the bot does not remember any recent readied students, it will tell the TA.
   *
   * There is currently no bot process for letting the user know it was an accident.
   *
   * @param {Object} message - The discord messsage object to interact with.
   */
  '!undo': (message) => {
    if (TA_CHANNEL === message.channel.id) {
      if (dequeued.length === 0) {
        message.react(NAK);
        message.reply('```nimrod\nThere is currently nothing in the dequeue cache.```');
        return;
      }
      queue.splice(0, 1, dequeued.pop());
      message.react(ACK);
      message.reply("```nimrod\nDone! Don't screw up next time!```");
    }
  },

  /**
   * TA's can use this command to remove items from the queue. If there is no one in the queue,
   * or the index is invalid it the TA will be warned.
   *
   * @param {Object} message - The discord message object to interact with.
   * @param {string[]} args - The first element in the array should be a number string
   * representing an index in the queue.
   */
  '!remove': (message, args) => {
    if (TA_CHANNEL !== message.channel.id) return;
    if (!isOnline(message.author) && !offlineCommands) {
      message.react(NAK);
      message.reply("You are offline. Can't remove.")
        .then((msg) => {
          msg.delete({
            timeout: 5000,
          });
        });
      return;
    }

    if (args.length === 0 || Number.isNaN(args[0])) {
      message.react(NAK);
      message.reply('Please provide an index to remove.')
        .then((msg) => {
          msg.delete({
            timeout: 5000,
          });
        });
      message.reply('`!remove <index>`')
        .then((msg) => {
          msg.delete({
            timeout: 5000,
          });
        });
      return;
    }

    const removeIndex = parseInt(args[0], 10);
    if (removeIndex >= queue.length) {
      message.react(NAK);
      message.reply('Invalid index.')
        .then((msg) => {
          msg.delete({
            timeout: 5000,
          });
        });
      return;
    }

    message.react(ACK);
    queue.splice(removeIndex, 1);
  },

  /**
   * TA's can use this command to notify students they are ready for them. If no index is provided,
   * it will use the first item in the queue. If the queue is empty warn the user.
   *
   * @param {Object} message - The discord messsage object to interact with.
   * @param {string[]} args - If provided the first element in the array should be a string number
   * representing a index in the queue to ready up.
   */
  '!ready': (message, args) => {
    if (TA_CHANNEL !== message.channel.id) return;
    if (!isOnline(message.author) && !offlineCommands ) {
      message.react(NAK);
      message.reply("You are offline. Can't ready up.")
        .then((msg) => {
          msg.delete({
            timeout: 5000,
          });
        });
      return;
    }

    if (queue.length === 0) {
      message.react(WARN);
      message.channel.send('```nimrod\nThe queue is currently empty```');
      return;
    }

    let readyIndex = 0;
    if (args.length > 0 && !Number.isNaN(args[0])) {
      readyIndex = parseInt(args[0], 10);
    }

    if (readyIndex < 0 || readyIndex >= queue.length) {
      message.react(NAK);
      message.reply('Invalid index.')
        .then((msg) => {
          msg.delete({
            timeout: 5000,
          });
        });
      return;
    }

    const authorId = message.author.id;
    const msg = queue[readyIndex].message;

    if (onlineTas[authorId].last_ready_msg !== undefined) {
      onlineTas[authorId].last_ready_msg.delete();
    }

    msg.reply(`${getNickname(message)} is ready for you. Move to their office.`)
      .then((reply) => {
        onlineTas[authorId].last_ready_msg = reply;
      });

    msg.delete();
    message.reply(`${getNickname(msg)} is next. There are ${queue.length - 1} people left in the queue.`);

    dequeued.push(queue[readyIndex]);
    queue.splice(readyIndex, 1);

    onlineTas[authorId].last_helped_time = new Date();

    message.react(ACK);
    message.delete({
      timeout: 5000,
    });
  },

  /**
   * TA's use this command to make themselves appear as online, and notify the students.
   * If they are already online, warn them.
   *
   * @param {Object} message - Discord message object to interact with.
   */
  '!online': (message) => {
    if (TA_CHANNEL === message.channel.id) {
      if (isOnline(message.author)) {
        message.reply('You are already online.')
          .then((msg) => {
            msg.delete({
              timeout: 5000,
            });
          });
        return;
      }

      message.react(ACK);

      onlineTas[message.author.id] = {}; // Marks the author as 'online'
      message.guild.channels.cache.get(OFFICE_HOURS).send(`${message.author} is now online. Ready to answer questions! :wave:`);
    }
  },

  /**
   * TA's use this command to make themselves appear offline, and notify the students.
   * If they are already offline, warn them.
   *
   * @param {Object} message - The discord messsage object to interact with.
   */
  '!offline': (message) => {
    if (TA_CHANNEL === message.channel.id) {
      if (!isOnline(message.author)) {
        message.react(NAK);
        message.reply('You are already offline.')
          .then((msg) => {
            msg.delete({
              timeout: 5000,
            });
          });
        return;
      }

      if(offlineCommands) {
        message.reply("You are now marked as offline, but you are still able to use certain commands offline.");
      } else {
        delete onlineTas[message.author.id];
        message.reply("You are now marked as offline. No commands will work as offline commands are not enabled.");
      }
      n
      message.guild.channels.cache.get(OFFICE_HOURS).send(`${message.author} is now offline. :x:`);
      message.react(ACK);
    }
  },

  /**
   * TA's use this command to allow themselves to enable and disable certain commands while offline.
   *
   * @param {Object} message - The discord messsage object to interact with.
   * @param {string[]} args - If provided the first element in the array should be a string
   * representing whether or not to enable the command.
   */
  '!off-commands': (message, args) => {
    if (TA_CHANNEL === message.channel.id) {

      if(args.length === 0) {

        message.react(ACK);
        offlineCommands = !offlineCommands;

        if(offlineCommands) {

          message.reply('Offline commands are turned `ON`.');
          message.react(ON);

        } else {

          message.reply('Offline commands are turned `OFF`.');
          message.react(OFF);

        }

        return;
      }

      if(args[0] === "on") {

        message.react(ACK);

        offlineCommands = true;

        message.reply('Offline commands are turned `ON`.');
        message.react(ON);

      } else if (args[0] == "off") {

        message.react(ACK);

        offlineCommands = false;

        message.reply('Offline commands are turned `OFF`.');
        message.react(OFF);

      } else {

        message.react(NAK);
        message.reply('The offline command setting could not be set due to an invalid argument.')
          .then((msg) => {
            msg.delete({
              timeout: 5000,
            });
          });

      }

      return
    }
  },

  /**
   * Any user can use this command to see a list of available commands for them. (Role-specific)
   *
   * @param {Obejct} message - The Discord message object to interact with.
   */
  '!help': (message) => {
    if (TA_CHANNEL === message.channel.id) {
      message.reply('```'
        + '!ping - simple test that responds with "pong".\n'
        + "!queue - view the queue w/ username, issue description, and how long they've been waiting.\n"
        + '!undo - quickly undo the ready command that removed them from the queue.\n'
        + '!remove <index> - removes user from queue at certain index. Does not alert the user.\n'
        + "!ready [index] - removes user from queue at index (top if index isn't provided). Alerts the user that the TA is ready.\n"
        + '!clear - removes all users from the queue and removes any next messages that were in the chat.\n'
        + '!off-commands [on, off] - enables/disables certain commands (ready, etc.) while TAs are offline.\n'
        + '!help - shows these commands.```');
      return;
    }
    message.reply('```'
      + "!next [issue] - adds a user to queue and responds with user's position in queue. Please provide an issue.\n"
      + '!leave - removes you from the queue.\n'
      + '\nhelp - provides a list of commands and their functions.```');
  },
};
