require('dotenv').config();
const Discord = require('discord.js');
const badWord = require('./badword.json')
const SpotifyWebApi = require('spotify-web-api-node');

const voiceBot = require('./src/join')

// Autentikasi dengan Spotify
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

spotifyApi.clientCredentialsGrant().then(
    function(data) {
        console.log('Token akses diterima');
        spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
        console.log('Tidak dapat mengambil token akses', err);
    }
);

// client discord
const client = new Discord.Client({ intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.GuildVoiceStates,
]});

client.on('messageCreate', async (message) => {

    const messageSelection  = message.content.toLocaleLowerCase(); 

    if (messageSelection === 'chaewon') {
        message.reply('Hallo~ , jadilah temanku ehe');
    }
    if (messageSelection === 'hello') {
        message.reply('Anyeong !!');
    }
    if (messageSelection === 'oi') {
        message.reply("oi ~~");
    }
    if (messageSelection === 'ping') {
        message.reply('Pong~!');
    }
    
    if(badWord.some(data => { return data === messageSelection } )) {
        message.reply('Uhh, Jangan berkata kasar ya ~!'); 
    }

    const sentence =  messageSelection.split(' ');
    
    if (sentence.length > 1 ) {
        const isMatch = badWord.some(word => sentence.includes(word));
        if(isMatch){
            message.reply('Uhh, Jangan berkata kasar ya ~!'); 
        }
    }  

    // spotify algorithm handle

    if (messageSelection === '!search') {
        const tracks = await spotifyApi.searchTracks('Smart');
        const firstTrack = tracks.body.tracks.items[0];
        message.channel.send(firstTrack.external_urls.spotify);
    }

    const prefix = '!'

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'join') {

        try { 
            await voiceBot.run( client, message, args , spotifyApi);

        } catch (error) {
            console.error(error);
            message.channel.send('Terjadi kesalahan saat mencoba bergabung ke voice channel.');
        }
    }

})

client.once('ready', () => {
    console.log('The Discord Bot is Ready!');
})

client.login(process.env.BOT_TOKEN)