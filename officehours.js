var queue = []
const TA_CHANNEL = "695206670883618827"

function positionInQueue(member) {
    for (var i = 0; i < queue.length; i++)
        if (queue[i].member.id == member.id) return i
    return -1
}

exports.onNext = (client, message, args) => {
    queue.push({
        member: message.member,
        desc: args.join(" "),
        timestamp: new Date()
    })

    message.add_reaction("👍")
    message.reply(`You are now #${queue.length} in the queue.`)
}

exports.onQueue = (client, message) => {
    message.channel.send(`There are currently ${queue.length} people in the queue.`)
    
    if (message.channel.id == TA_CHANNEL) {
        for (var i = 0; i < queue.length; i++) {
            var username = queue[i].member.nick
            var waitTime = moment(queue[i].timestamp)
            var desc = queue[i].desc

            message.channel.send(` #${i+1}: ${username} ${waitTime}\n ${desc}`)
        }
        return
    }

    const index = positionInQueue(client.member)
    if(-1 != index)
        message.reply(`You are #${index + 1} in the queue!`)
}

exports.onRemove = (client, message, args) => {
    if (args.length == 0 || !Number.isInteger(args[0])) {
        message.reply("Please provide an index to remove.")
        message.reply("```!remove <index>`")
        return
    }
    var index = parseInt(args[0])
    queue.splice(index, 1)
    message.add_reaction("👍")
    message.reply(`There are now ${queue.length} people on the queue.`)
}

exports.onHelp = (client, message) => {
    message.reply("To join the queue, type ```next``` followed by a brief description of what you need help with.")
}
