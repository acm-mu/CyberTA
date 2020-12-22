# CyberTA - Discord Queue Bot

CyberTA was designed in the COVID-19 pandemic to help Operating Systems TAs with their queue based office hours. The inspiration came from other twitch.tv bots that allowed users to be put in a queue for games. It uses Discord.js and Heroku apps to create a 24/7 bot that monitors multiple text-channels. 

# Commands
  - `!ping` - simple test that responds "pong"
  - `!next` - adds a user to queue and responds with user's position in queue, (optional: `!next + 'issue description'` ),
  - `!queue` - view the queue w/ user name, issue description, how long they've been waiting
  - `!undo` - quickly undo the next call that put the user in queue
  - `!remove` - takes a index paramater (i:e remove 2), removes user from queue at certain index, alerts user that TA is ready, deletes user's !next call
  - `!ready` - removes user from top of the queue, alerts user that the TA is ready, deletes !next call from top user, tells time spent on previous team (if available)
  - `!online` - enables !next command, sets TA to online
  - `!offline` - disables !next command, sets TA to offline
  - `!clear` - clears the queue and deletes all `next` messages that were in the queue
  - `!help` - provides list of commands and their functions

### Dependencies
CyberTA uses the following tech:
* [Discord] - Based communication software
* [Discord.js] - chat bot language
* [Heroku] - used for hosting the bot 

### Deploying CyberTA with Heroku
These instructions are for installing CyberTA to a Heroku application. You will need a GitHub, Heroku, and discord developer account as well as manage server permissions to a Discord server.

1. Fork this repository to your GitHub account, or an account you have access to.
##### Heroku Instance
1. Create a new app, call it whatever you'd like (only you will see this).
2. For deployment method, choose Github, search for your fork and connect.
3. Once it has connected successfully a new section called "Manual deploy" will appear, deploy master to pull the code from GitHub.
4. The Heroku instance will now install dependencies, and you will need to configure the app.
##### Discord Bot
6. Goto https://discord.com/developers/applications.
7. Create a new application (again, call it whatever you'd like, this is for you).
8. Once you have created your app, add a bot and copy the bot token.
9. If you'd like to change the username field now, this is what will your bot will be called.
9. Go back to your Heroku app settings, under 'Settings', reveal config vars.
10. Create a new variable `BOT_TOKEN` and paste your copied token.
11. On your Discord server right click the channel you wish to designate for the TA's to manage the queue (You may need to hold shift) and click 'Copy ID'.
12. This ID will be the `TA_CHANNEL` config var on Heroku.
13. Do the same for the office hours channel creating a `OFFICE_HOURS` config var with the corresponding ID on Heroku.
14. To add this Bot to your server, go to https://scarsz.me/authorize. You can find your client Id from the Discord application settings, under 'General Information'.
15. Choose the server you'd like to deploy the bot to, and 'Authorize'. 
16. Back on Heroku, under the 'Resources' section you should now have two Dynos a web and a node worker. Disable the web and enable the node worker.
17. This will restart the application and your bot should now be functional.

### Running Locally or Deploying to Custom Hosting
These instructions assume you have your own hosting platform (or your own computer) and node.js installed. You only need a discord developer account, but a GitHub account is recommended to receive future updates.

1. Clone / Download this repo to the local directory of your hosting platform (this can be your local machine) of choice.
2. Inside the repo directory run the command `npm install` to install dependencies.
3. Create a file named `.env` in this directory following the example below. (This will contain secret application-specific environment variables, do not push upstream!)
4. Goto https://discord.com/developers/applications.
5. Create a new application (again, call it whatever you'd like, this is for you).
6. Once you have created your app, add a bot and copy the bot token.
7. If you'd like to change the username field now, this is what will your bot will be called.
8. Paste your bot token into the `<BOT_TOKEN>` placeholder in the example file.
9. On your Discord server right click the channel you wish to designate for the TA's to manage the queue (You may need to hold shift) and click 'Copy ID'.
10. This ID will be the `<TA_CHANNEL>` value in the `.env` file example.
11. Do the same for the office hours channel filling in `<OFFICE_HOURS>` with the corresponding ID.
12. To add this Bot to your server, go to https://scarsz.me/authorize. You can find your client Id from the Discord application settings, under 'General Information'.
13. Choose the server you'd like to deploy the bot to, and 'Authorize'.
14. Back on your hosting platform, run the command `npm start` from the repo directory. 

### Example .env File
```
BOT_TOKEN=<BOT_TOKEN>
TA_CHANNEL=<TA_CHANNEL>
OFFICE_HOURS=<OFFICE_HOURS>
```

License
----

MIT

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [Discord]: <https://discordapp.com/r>
   [Discord.js]: <https://discord.js.org/#/>
   [Heroku]: <https://www.heroku.com/home>
