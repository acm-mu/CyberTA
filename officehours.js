/* eslint-disable no-console */
const ACK = '👍';
const NAK = '🛑';
const WARN = '⚠️';

const moment = require('moment');

let x = 0;
let queue = [];
const dequeued = [];

const { OFFICE_HOURS, TA_CHANNEL } = process.env;

const onlineTas = { };

function getNickname(message) {
  const member = message.guild.member(message.author);
  if (member.nickname !== null) {
    return member.nickname;
  }
  return member.user.username;
}

function isOnline(member) {
  return member.id in onlineTas;
}

function ready(message, readyIndex) {
  /**
     * If the next person in the queue is offline, it should skip over them.
     * This will be a permenant skip, and will not add it to the dequeue cache.
     */
  if (readyIndex >= queue.length) return;

  const authorId = message.author.id;
  const msg = queue[readyIndex].message;
  const nickname = getNickname(message);

  if (onlineTas[authorId].last_ready_msg !== undefined)
    onlineTas[authorId].last_ready_msg.delete();

  msg.reply(`${nickname} is ready for you. Move to TA office.`)
  .then((reply) => {
    onlineTas[authorId].last_ready_msg = reply;
  });

  msg.delete();
  message.reply(`${getNickname(msg)} is next. There are ${queue.length - 1} people left in the queue.`);

  dequeued.push(queue[readyIndex]);
  queue.splice(readyIndex, 1);

  onlineTas[authorId].last_helped_time = new Date();

  message.react(ACK);
  message.delete({ timeout: 5000 });
}

function index(member) {
  for (let i = 0; i < queue.length; i += 1) {
    if (queue[i].member.id === member.id) {
      return i;
    }
  }
  return -1;
}

function contains(member) {
  return index(member) !== -1;
}

/**
 * Users can add themselves to the queue via the next command. If users are
 * already in the queue, it will let them know and quit. The bot will also
 * let them know on success
 */

exports.onNext = (message, args) => {
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
        msg.delete({ timeout: 5000 });
        message.delete({ timeout: 5000 });
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
      msg.delete({ timeout: 10 * 1000 });
    });
};

/**
 * If a TA accidently readied a student, and needs to put them back in the queue.
 * '!undo' will automatically put the last dequeued member back to the front of the queue.
 *
 * If the bot does not remember any recent readied students, it will tell the TA.
 *
 * There is currently no Bot process for letting the user know it was an accident
 */

exports.onUndo = (message) => {
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
};

exports.onQueue = (message) => {
  if (OFFICE_HOURS === message.channel.id) {
    message.react(ACK);

    if (queue.length === 0) {
      message.channel.send('```nimrod\nThe queue is currently empty```');
      return;
    }
    let body = `\`\`\`nimrod\nThere are currently ${queue.length} people in the queue.`;
    const position = index(message.author);
    if (position !== -1) {
      body += `You are #${position + 1}!`;
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
      const { username } = queue[i].member;
      const waitTime = moment(queue[i].timestamp).fromNow();
      const { desc } = queue[i];

      body.push(`${i}) ${username} "${desc}"\t\t [${waitTime}]`);
    }
    message.channel.send(`\`\`\`nimrod\n${body.join('\n')}\`\`\``);
  }
};

// This potentially could be where the TA-leave functionality goes
exports.onLeave = (message) => {
  if (OFFICE_HOURS === message.channel.id) {
    if (!contains(message.author)) {
      message.react(NAK);
      message.delete({ timeout: 10 * 1000 });
      return;
    }

    queue.splice(index(message.author), 1);
    message.react(ACK);
    message.delete({ timeout: 10 * 1000 });
  }
};

exports.onRemove = (message, args) => {
  if (TA_CHANNEL !== message.channel.id) return;
  if (!isOnline(message.author)) {
    message.react(NAK);
    message.reply("You are offline. Can't remove.")
    .then((msg) => {
      msg.delete({ timeout: 5000 });
    });
    return;
  }

  if (args.length === 0 || Number.isNaN(args[0])) {
    message.react(NAK);
    message.reply('Please provide an index to remove.')
    .then((msg) => {
      msg.delete({ timeout: 5000 });
    });
    message.reply('`!remove <index>`')
    .then((msg) => {
      msg.delete({ timeout: 5000 });
    });
    return;
  }

  const removeIndex = parseInt(args[0], 10);
  if (removeIndex >= queue.length) {
    message.react(NAK);
    message.reply('Invalid index.')
    .then((msg) => {
      msg.delete({ timeout: 5000 });
    });
    return;
  }

  message.react(ACK);
  queue.splice(removeIndex, 1);
};

exports.onReady = (message, args) => {
  if (TA_CHANNEL !== message.channel.id) return;
  if (!isOnline(message.author)) {
    message.react(NAK);
    message.reply("You are offline. Can't ready up.")
    .then((msg) => {
      msg.delete({ timeout: 5000 });
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
      msg.delete({ timeout: 5000 });
    });
    return;
  }

  ready(message, readyIndex);
};

exports.onOof = (message) => {
  x += 1;
  message.reply(`There has been ${x} 'persistent' questions to date.`);
};

exports.onOnline = (message) => {
  if (TA_CHANNEL === message.channel.id) {
    if (isOnline(message.author)) {
      message.reply('You are already online.')
      .then((msg) => {
        msg.delete({ timeout: 5000 });
      });
      return;
    }

    message.react(ACK);

    onlineTas[message.author.id] = {}; // Marks the author as 'online'
    message.guild.channels.cache.get(OFFICE_HOURS).send(`${message.author} is now online. Ready to answer questions! :wave:`);
  }
};

exports.onOffline = (message) => {
  if (TA_CHANNEL === message.channel.id) {
    if (!isOnline(message.author)) {
      message.react(NAK);
      message.reply('You are already offline.')
      .then((msg) => {
        msg.delete({ timeout: 5000 });
      });
      return;
    }
    delete onlineTas[message.author.id];
    message.guild.channels.cache.get(OFFICE_HOURS).send(`${message.author} is now offline. :x:`);
    message.react(ACK);
  }
};

exports.onHelp = (message) => {
  if (TA_CHANNEL === message.channel.id) {
    message.reply('```'
        + 'ping - simple test that responds with "pong".\n'
        + "!queue - view the queue w/ username, issue description, and how long they've been waiting.\n"
        + '!undo - quickly undo the ready command that removed them from the queue.\n'
        + '!remove <index> - removes user from queue at certain index. Does not alert the user.\n'
        + "!ready [index] - removes user from queue at index (top if index isn't provided). Alerts the user that the TA is ready.\n"
        + '!clear - removes all users from the queue and removes any next messages that were in the chat.\n'
        + '!help - shows these commands.```');
    return;
  }
  message.reply('```'
        + "next [issue] - adds a user to queue and responds with user's position in queue. Please provide an issue.\n"
        + '\nhelp - provides a list of commands and their functions.```');
};

exports.onClear = (message) => {
  if (TA_CHANNEL !== message.channel.id) return;

  if (queue.length === 0) {
    message.react(WARN);
    message.channel.send('```nimrod\nThe queue is currently empty```');
    return;
  }

  message.react(ACK);

  /* Goes through entire queue and finds the student's 'next' message and removes it */
  for (let i = queue.length - 1; i >= 0; i -= 1) {
    const msg = queue[i].message;
    msg.delete();
  }

  /* Instead of emptying the queue entry by entry, just set the queue equal to the empty set */
  queue = [];
  if (queue.length === 0) {
    message.channel.send('```nimrod\nThe queue is now empty!```');
  }
};