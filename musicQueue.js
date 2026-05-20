const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, entersState, StreamType } = require('@discordjs/voice');
const { spawn, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const queues = new Map();

// Detectar si estamos en Windows o Linux (Replit)
const isWindows = os.platform() === 'win32';
const ytdlpPath = isWindows
  ? path.join(__dirname, 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe')
  : 'yt-dlp';
const cookiesPath = path.join(__dirname, 'cookies.txt');

// Encontrar Node.js automáticamente
function getNodePath() {
  return process.execPath; // Funciona en Windows y Linux
}

function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, {
      tracks: [],
      current: null,
      connection: null,
      player: null,
      channel: null,
    });
  }
  return queues.get(guildId);
}

// Buscar en YouTube usando yt-dlp
function searchYouTube(query) {
  return new Promise((resolve, reject) => {
    const args = [
      `ytsearch1:${query}`,
      '--dump-json',
      '--no-warnings',
      '--no-check-certificates',
      '--no-playlist',
      '--js-runtimes', `node:${getNodePath()}`,
    ];

    if (fs.existsSync(cookiesPath)) {
      args.push('--cookies', cookiesPath);
    }

    execFile(ytdlpPath, args, { timeout: 30000 }, (error, stdout) => {
      if (error || !stdout) {
        return reject(error || new Error('Sin resultados'));
      }
      try {
        const data = JSON.parse(stdout);
        resolve({
          title: data.title || 'Desconocido',
          url: data.webpage_url || data.url,
          author: data.channel || data.uploader || 'Desconocido',
          duration: data.duration_string || '0:00',
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}

function getAudioStream(url) {
  const ffmpegPath = require('ffmpeg-static');

  const ytArgs = [
    '-f', 'bestaudio',
    '-o', '-',
    '--no-warnings',
    '--no-check-certificates',
    '--no-playlist',
    '--js-runtimes', `node:${getNodePath()}`,
  ];

  // Solo usar cookies si el archivo existe
  if (fs.existsSync(cookiesPath)) {
    ytArgs.push('--cookies', cookiesPath);
  }

  ytArgs.push(url);

  const ytProcess = spawn(ytdlpPath, ytArgs);

  const ffmpeg = spawn(ffmpegPath, [
    '-i', 'pipe:0',
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2',
    'pipe:1',
  ]);

  ytProcess.stdout.pipe(ffmpeg.stdin);

  ytProcess.stderr.on('data', () => {});
  ffmpeg.stderr.on('data', () => {});

  ytProcess.on('error', (err) => console.error('yt-dlp error:', err.message));
  ffmpeg.on('error', (err) => console.error('ffmpeg error:', err.message));

  return ffmpeg.stdout;
}

async function playSong(guildId) {
  const queue = getQueue(guildId);

  if (queue.tracks.length === 0) {
    queue.current = null;
    if (queue.connection) {
      queue.connection.destroy();
      queue.connection = null;
    }
    queues.delete(guildId);
    return;
  }

  const track = queue.tracks.shift();
  queue.current = track;

  try {
    const stream = getAudioStream(track.url);
    const resource = createAudioResource(stream, { inputType: StreamType.Raw });

    queue.player.play(resource);
  } catch (error) {
    console.error('Error al reproducir:', error.message);
    if (queue.channel) queue.channel.send(`⚠️ Error al reproducir: **${track.title}**. Saltando...`);
    playSong(guildId);
  }
}

function createConnection(queue, guildId, voiceChannel) {
  queue.connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guildId,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  queue.connection.on('error', (error) => {
    console.error('Connection error:', error.message);
  });

  queue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(queue.connection, VoiceConnectionStatus.Signalling, 5000),
        entersState(queue.connection, VoiceConnectionStatus.Connecting, 5000),
      ]);
    } catch (e) {
      if (queue.connection) queue.connection.destroy();
      queue.connection = null;
      queue.current = null;
      queues.delete(guildId);
    }
  });

  queue.player = createAudioPlayer({
    behaviors: { noSubscriber: NoSubscriberBehavior.Play },
  });

  queue.connection.subscribe(queue.player);

  queue.player.on(AudioPlayerStatus.Idle, () => {
    playSong(guildId);
  });

  queue.player.on('error', (error) => {
    console.error('Player error:', error.message);
    playSong(guildId);
  });
}

async function addTrack(guildId, voiceChannel, textChannel, query) {
  const queue = getQueue(guildId);
  queue.channel = textChannel;

  const track = await searchYouTube(query);

  if (!track) {
    return null;
  }

  queue.tracks.push(track);

  if (!queue.connection) {
    createConnection(queue, guildId, voiceChannel);
  }

  if (!queue.current) {
    await playSong(guildId);
  }

  return track;
}

async function addTracks(guildId, voiceChannel, textChannel, tracks) {
  const queue = getQueue(guildId);
  queue.channel = textChannel;

  queue.tracks.push(...tracks);

  if (!queue.connection) {
    createConnection(queue, guildId, voiceChannel);
  }

  if (!queue.current) {
    await playSong(guildId);
  }
}

module.exports = { getQueue, queues, addTrack, addTracks, playSong, searchYouTube };
