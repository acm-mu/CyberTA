const moment = require('moment')
var x = 0

var queue = []
var dequeued = []

var d = new Date();
d.setHours(0,0,0,0);

const OFFICE_HOURS = process.env.OFFICE_HOURS
const TA_CHANNEL = process.env.TA_CHANNEL

const tas = {
    "411720574528913418": {
        name: "Brad",
        last_helped_id: null,
        last_helped_time: d
    },
    "117015211952570374": {
        name: "Jack",
        last_helped_id: null,
        last_helped_time: d
    },
    "97501254363664384": {
        name: "Avery",
        last_helped_id: null,
        last_helped_time: d
    },
    "375835699037077515": {
        name: "Patrick",
        last_helped_id: null,
        last_helped_time: d
    },
}
function ready(message, index) {

    /**
     * If the next person in the queue is offline, it should skip over them.
     * This will be a permenant skip, and will not add it to the dequeue cache.
     */

    var msg = queue[index].message
    msg.reply(`${tas[message.author.name]} is ready for you. Move to TA office.`)
    msg.delete()
    
    //Tells you time spent and people on queue.
    startTime = tas[message.author.id].last_helped_time
    endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    timeDiff /= 1000;
    var timespent = Math.round(timeDiff) / 60;
    message.reply("You have spent " + timespent +  " minutes with " + (queue[index].member.toString()) + `. ` + (queue.length - 1) +" people on the queue.");
    
    
    dequeued.push(queue[index])
    queue.splice(index, 1)
    tas[message.author.id].last_helped_time = new Date();
    
    message.react("👍")
 
}

function contains(member) {
    for (var i = 0; i < queue.length; i++) 
        if (queue[i].member.id == member.id) 
            return true
    return false
}

/**
 * Users can add themselves to the queue via the next command. If users are 
 * already on the queue, it will let them know and quit. The bot will also
 * let them know on success
 */

exports.onNext = (client, message, args) => {
    if (message.channel.id != OFFICE_HOURS) return // Behavior is only in the os-office-hours channel
    
    if (contains(message.author)) {
        message.react("🛑")
        message.reply("You are already on the queue.")
            .then(msg => {
                msg.delete( { timeout: 5000 })
                message.delete({ timeout: 5000 })
            })
        return
    }

    queue.push({
        member: message.author,
        desc: args.join(" "),
        message: message,
        timestamp: new Date()
    })

    message.react("👍")

    message.reply(`You are now #${queue.length} in the queue.`)
       .then(msg => {
            msg.delete({ timeout: 10 * 1000 }) 
        })
}

/**
 * If a TA accidently readied a student, and needs to put them back on the queue.
 * '!undo' will automatically put the last dequeued member back to the front of the queue.
 * 
 * If the bot does not remember any recent readied students, it will tell the TA.
 * 
 * There is currently no Bot process for letting the user know it was an accident
 */

exports.onUndo = (client, message) => {
    if (TA_CHANNEL == message.channel.id) {
        if (dequeued.length == 0) {
            message.react("🛑")
            message.reply("```There is currently nothing in the dequeue cache.```")
            return
        }
        queue.splice(0, 1, dequeued.pop())
        message.reply("```All Done! Don't screw up next time!")
    }
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
    ready(message, index);
}

exports.onReady = (client, message) => {
    if (TA_CHANNEL != message.channel.id) return

    if (queue.length == 0) {
        message.reply("The queue is empty right now, crack open a beer")
        return
    }
    //TO:DO calculate time spent with user.
    ready(message, 0)
}

exports.onOof = (client, message, args) => {
     x++;
     message.reply("There has been " + x + " 'persistent' questions to date.")
}


exports.onHelp = (client, message) => {
    if (OFFICE_HOURS == message.channel.id)
        message.reply("To join the queue, type ```next``` or ```!next``` followed by a brief description of what you need help with.")
    else
        message.reply("!queue to view the queue. !remove <index> to remove user, and notify them you're ready.")
}
