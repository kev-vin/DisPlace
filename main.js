//Kevin & SegFault's Discord Hackweek Submission
//main.js

const Discord = require('discord.js');
const Grid = require('./grid.js');
const webServer = require('./web.js');
const client = new Discord.Client();

//let gridInstance = new Grid(500, 500);


let connectedGuilds = {};
let gameGrid;
const brushStates =        {'🖌'  : true, '❌': false};
const translateMovements = {'🔼' : 1, '▶' : 2, '🔽' : 3, '◀' : 4};
const translateColors =    {'🔴' : 'red', '💚' : 'green', '🔵' : 'blue', '💛' : 'yellow', '⚫' : 'black', '⚪' : 'white'};


//Find or create channel for bot to use.
async function getDisplaceChannel(guild){
  return new Promise((resolve, reject) => {
    let displaceChannel = guild.channels.find(x => x.name === "_displace");
    if(displaceChannel==null){
      guild.createChannel('_displace', {
        type: 'text',
        permissionOverwrites: [{
          id: guild.id,
          deny: ['SEND_MESSAGES', 'ADD_REACTIONS']
        }]
      }).then((nChannel) => {
        resolve(nChannel);
      }).catch((e) => {
        reject(0);
      });
    }else{
      resolve(displaceChannel);
    }
  });
}

function genEmbed(guID, existingMsg){
  let imgURL = "https://cdn.discordapp.com/attachments/548683437524123660/592473816958238720/aojl5xUBnZ.png"
  let currentColor = gameGrid.getBrushColor("G_" + guID);
  let brushState = gameGrid.getBrushState("G_" + guID);
  if(existingMsg==null){
    imgURL = "https://displace.cc/api/renderZoomedGrid/G_" + guID + "/" + (new Date).getTime() + ".png"
  }else{
    imgURL = (existingMsg.embeds[0] !=null ? existingMsg.embeds[0].image.url : imageURL);
  }
  return {
    "embed": {
      "title": "Click here to see the whole image!",
      "url": "https://displace.cc/api/showCanvas",
      "color": 7506394,
      "footer": {
        "text": "React below to control your brush!"
      },
      "image": {
        "url": imgURL
      },
      "author": {
        "name": "DisPlace Game",
        "url": "https://discordapp.com",
        "icon_url": "https://cdn.discordapp.com/attachments/548683437524123660/592389797096456193/35665b6147e6ea2d0a8c6cb759d4a281.png"
      },
      "fields": [
        {
          "name": "Brush Color:",
          "value": Object.keys(translateColors).find(key => translateColors[key] === currentColor),
          "inline": true
        },
        {
          "name": "Brush State:",
          "value": (brushState ? "**Drawing**" : "**Moving**"),
          "inline": true
        }
      ]
    }
  }
}

function sendToDisplaceChannel(guild){
  getDisplaceChannel(guild).then((disChannel)=>{
    disChannel.send(genEmbed(guild.id, null)).then((embedMessage)=>{
      connectedGuilds[guild.id] = embedMessage;

      disChannel.send("`Movement Controls`").then((m)=> {
        disChannel.send("`Colour Controls`").then((c)=>{
          c.react('🔴').then(() =>
          c.react('💚')).then(() =>
          c.react('🔵')).then(() =>
          c.react('💛')).then(() =>
          c.react('⚫')).then(() =>
          c.react('⚪'))
        });
        m.react('◀').then(() =>
          m.react('🔼')).then(() =>
          m.react('🔽')).then(() =>
          m.react('▶' )).then(() =>
          m.react('🖌' )).then(() =>
          m.react('❌'));
        });
    });
    });
}

client.on('messageReactionAdd', (r, u) => {
  if(u==client.user) { return; }
  
  if(r.message.channel.name=="_displace"){
    let rGuild = "G_" + r.message.guild.id; 
    let mess = connectedGuilds[r.message.guild.id]

    r.remove(u).catch((e)=>console.log(e));
    if(r.emoji.name in translateColors) {
      gameGrid.setColor(rGuild, translateColors[r.emoji.name])
      mess.edit(genEmbed(mess.guild.id, mess)).catch((e)=>console.log(e)) //Update colour state
    } 
    else if (r.emoji.name in translateMovements) {
      try {
        console.log(rGuild);
        gameGrid.moveBrush(translateMovements[r.emoji.name], rGuild);
        mess.edit(genEmbed(mess.guild.id)).catch((e)=>console.log(e)) //Update image
      } catch(e){ console.log(e); }
    }
    else if (r.emoji.name in brushStates) {
      gameGrid.setPlacement(rGuild, brushStates[r.emoji.name]);
      mess.edit(genEmbed(mess.guild.id, mess)).catch((e)=>console.log(e)) //Update brush state
    }

  }
});

client.on('ready', () => {

  //Find all connected guilds and update object.
  gameGrid = new Grid(160, 160);

  let savedGuilds = client.guilds.array();
  for(let g in savedGuilds){
    sendToDisplaceChannel(savedGuilds[g]);
    gameGrid.getBrush("G_" + savedGuilds[g].id);
  }

  //gameGrid.createBrush("G_591620739547791370");
  gameServer = new webServer(gameGrid);

  console.log("Bot Ready");


});

client.on('guildCreate', guild => {
  
  //Add new guild to object.
  sendToDisplaceChannel(guild)
  console.log("The following Guild has been added: " + guild.name);
  gameGrid.createBrush("G_" + guild.id);
  //gridInstance.createBrush(guild.id);

});

client.on("guildDelete", guild => {

  //Remove guild from object.
  delete connectedGuilds[guild.id];
  console.log("The following Guild has been removed: " + guild.name);
  console.log(connectedGuilds);

})

client.on('message', msg => {
  if(msg.content=='shutdown'){
    process.exit();
  }
  if(msg.content=='guilds'){
    console.log(connectedGuilds);
  }
});

client.login('NTkxNjIwOTk3OTEyOTg1NjAw.XQzcDQ.OiUvF12X_7eqsWWr-BqHqjyQLVk');