const Discord = require('discord.js')
const client = new Discord.Client()
const officehours = require('./officehours')

client.on('message', message => {
    const cmd = message.content.split(" ")[0]
    const args = message.content.replace(cmd, "")

    switch(cmd) {
        case "next":
            officehours.onNext(client, message, args);
            break
        case "!queue":
            officehours.onQueue(client, message);
        case "!remove":
            officehours.onRemove(client, message, args);
            break;
        case "!help":
            officehours.onHelp(client, message);
    }
})

client.login(process.env.BOT_TOKEN)
