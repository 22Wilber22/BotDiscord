const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');
const { YouTubeExtractor } = require('@discord-player/extractor');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const player = new Player(client, {
  ytdlOptions: {
    quality: 'lowestaudio',
    highWaterMark: 1 << 25,
  },
});

// Cargar comandos automáticamente
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'Commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.name, command);
}

client.once('ready', async () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  client.user.setActivity('!help para ver comandos', { type: 'LISTENING' });

  // Cargar extractores
  await player.extractors.register(YouTubeExtractor);
  console.log('🎵 Extractor de YouTube cargado');
});

player.events.on('error', (queue, error) => {
  console.error('Error en la cola:', error);
});

player.events.on('playerError', (queue, error) => {
  console.error('Error del reproductor:', error);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('Hubo un error al ejecutar el comando');
  }
});

client.login(process.env.DISCORD_TOKEN);