# CyberTA - Discord Queue Bot

CyberTA was designed in the COVID-19 pandemic to help Operating Systems TA with their queue based office hours. The inspiration came from other twitch.tv bots that allowed users to be put in a queue for games. It uses Discord.js and Heroku apps to create a 24/7 bot that monitors multiple text-channels. 

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

### Tech
CyberTA uses the following tech:
* [Discord] - Based communication software
* [Discord.js] - chat bot language
* [Heroku] - used for hosting the bot 

### Installation

To be written
### TO:DOs

 - Persistent Queue
 - Add a TA remove that does not alert students
 - possibly remove discord IDs to config var so that it'll remain private if github repo goes public

License
----

MIT

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [Discord]: <https://discordapp.com/r>
   [Discord.js]: <https://discord.js.org/#/>
   [Heroku]: <https://www.heroku.com/home>

## Features To Be Implemented
* **Persistant Queue**
* Remove someone from the queue without ready-ing them.
* Next time a TA ready's someone, give a time on how long they spent with the last student
