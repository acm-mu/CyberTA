const Discord = require('discord.js')
const client = new Discord.Client()
const officehours = require('./officehours')

client.on('ready', () => {
    console.log("[CyberBot] CyberBot has finished loading, and is enabled!")
})

client.on('message', message => {
    // Only listen in bot's channels
    if (process.env.TA_CHANNEL != message.channel.id 
        && process.env.OFFICE_HOURS != message.channel.id) 
        return

    var args = message.content.split(" ")
    const cmd = args[0].toLowerCase()
    args.splice(0, 1)

    switch(cmd) {
        case "!ping":
        case "ping":
            message.reply("Pong!")
            break
        case "next":
        case "!next":
            officehours.onNext(message, args)
            break
        case "!leave":
            officehours.onLeave(message, args)
            break
        case "!queue":
            officehours.onQueue(message, args)
            break
        case "!undo":
            officehours.onUndo(message, args)
            break
        case "!remove":
            officehours.onRemove(message, args)
            break
        case "!oof":
            officehours.onOof(message, args)
            break 
        case "!ready":
        case "ready":
            officehours.onReady(message, args)
            break
        case "!help":
            officehours.onHelp(message, args)
    }
})

client.login(process.env.BOT_TOKEN)
