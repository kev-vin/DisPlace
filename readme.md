# DisPlace - A Discord Drawing Game
#### By Kevin#3848 and SegFault#0001

Made for the June 2019 [Discord Hack Week](https://blog.discordapp.com/discord-community-hack-week-build-and-create-alongside-us-6b2a7b7bba33), DisPlace is a fun collaberative drawing tool designed to allow communities to compete or collaborate in order to draw artwork on a shared canvas.

> [Come take a look at displace.cc !](https://displace.cc/)

## How it works.
Once you [invite]((https://displace.cc/)) our bot to your server, a channel will be created for you in which you can interact with the bot. Use reactions to control it, and watch it update in the preview view (on your discord server), or see it in the scope of everyone elses work, through the [shared grid](https://displace.cc/api/showCanvas) on our website!

![Example of the product in use](https://media.discordapp.net/attachments/480017492882751488/593884590595375114/unknown.png?width=413&height=522)

Your entire community can control your community's shared brush, so good luck working together if you want to create anything cool! See if you can team up with any friendly communities to work on something together!

## How it actually works.
Ok, so the technical stuff. We worked really hard to create something robust and complicated with the time we had. We managed to implement two views - a local community view, and a full canvas view on our website.

To do this, we have our Discord bot rendering a 25-tile window of the grid by querying SQLite3 on our web-server for updates. The bot processes the response and provides each guild with its local view. The users reactions are then sent as requests to our server to update the game state, as well as web-socket messages to update the website for all clients in real-time.

We learned a lot about some really cool open source technologies for this project, by using DiscordJS (through Node), Express, SQLite3, Socket.IO, Cairo, and NGINX. It's been an a really fun experience, and we hope you like our project!
