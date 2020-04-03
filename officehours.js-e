const moment = require('moment')

var queue = []
var x = 0;
const CHANNEL = "695206607008694302"
const TA_CHANNEL = "695206670883618827"

function positionInQueue(member) {
    for (var i = 0; i < queue.length; i++)
        if (queue[i].member.id == member.id) return i
    return -1
}

exports.onNext = (client, message, args) => {
    if (message.channel.id != CHANNEL) return // Behavior is only in the os-office-hours channel
    queue.push({
        member: message.author,
        desc: args.join(" "),
        message: message,
        timestamp: new Date()
    })

    message.react("👍")
    //message.reply(`You are now #${queue.length} in the queue.`)
}

exports.onQueue = (client, message) => {
    if (TA_CHANNEL == message.channel.id) {
        var body = ""
        if (queue.length == 0) {
            body = "The queue is empty right now! :D"
        } else {
            for (var i = 0; i < queue.length; i++) {
                var username = queue[i].member.username
                var waitTime = moment(queue[i].timestamp).fromNow()
                var desc = queue[i].desc

                body += `${i}) ${username}, " ${desc} ", ${waitTime}\n`
            }
        }
        message.channel.send("```nimrod\n" + body + "```")
        return
    } else if (CHANNEL == message.channel.id) {
        const index = positionInQueue(message.author)
        if(-1 != index)
            message.reply(`You are #${index + 1} in the queue!`)
    }
}

exports.onRemove = (client, message, args) => {
    if (TA_CHANNEL != message.channel.id) return
    
    if (args.length == 0 || isNaN(args[0])) {
        message.reply("Please provide an index to remove.")
        message.reply("`!remove <index>`")
        return
    }
    var index = parseInt(args[0])

    var msg = queue[index].message
    msg.reply(`${message.author.username} is ready for you. Move to TA office.`)
    msg.delete()

    queue.splice(index, 1)

    message.react("👍")
    message.reply(`There are now ${queue.length} people on the queue.`)
}

exports.onReady = (client, message) => {
    if (TA_CHANNEL != message.channel.id) return

    if (queue.length == 0) {
        message.reply("The queue is empty right now, crack open a beer")
        return
    }

    var next = queue[0]
    next.message.reply(`${message.author.username} is ready for you. Move to TA Office`)
    next.message.delete()

    queue.splice(0, 1)

    message.react("👍")
    message.reply(`There are now ${queue.length} people on the queue.`)
}

exports.onWow = (client, message, args) => {
     x++;
     message.reply("There has been " + x + " 'interesting' questions to date.")
    //message.reply(`You are now #${queue.length} in the queue.`)
}


exports.onHelp = (client, message) => {
    if (CHANNEL == message.channel.id)
        message.reply("To join the queue, type ```next``` followed by a brief description of what you need help with.")
    else
        message.reply("!queue to view the queue. !remove <index> to remove user, and notify them you're ready.")
}
