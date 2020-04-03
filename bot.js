const Discord = require('discord.js')
const client = new Discord.Client()
const officehours = require('./officehours')

client.on('ready', () => {
    console.log("[CyberBot] CyberBot has finished loading, and is enabled!")
})

client.on('message', message => {
    var args = message.content.split(" ")
    const cmd = args[0].toLowerCase()
    args.splice(0, 1)

    switch(cmd) {
        case "ping":
            message.reply("Pong!")
            break
        case "next":
        case "!next":
            officehours.onNext(client, message, args)
            break
        case "!queue":
            officehours.onQueue(client, message)
            break
        case "!undo":
            officehours.onUndo(client, message)
            break
        case "!remove":
            officehours.onRemove(client, message, args)
            break
        case "!oof":
            officehours.onOof(client, message, args)
            break 
        case "!ready":
        case "ready":
            officehours.onReady(client, message)
            break
        case "!help":
            officehours.onHelp(client, message)
    }
})

client.login(process.env.BOT_TOKEN)
