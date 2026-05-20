const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, NoSubscriberBehavior, VoiceConnectionStatus, entersState, StreamType } = require('@discordjs/voice');
const play = require('play-dl');
const ytdlp = require('yt-dlp-exec');
const { spawn } = require('child_process');
const path = require('path');

const queues = new Map();

const ytdlpPath = path.join(__dirname, 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp');

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

async function getAudioStream(url) {
  const process = spawn(ytdlpPath, [
    '-f', 'bestaudio',
    '-o', '-',
    '--no-warnings',
    '--no-check-certificates',
    url,
  ]);

  return process.stdout;
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
    const stream = await getAudioStream(track.url);
    const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });

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

  const results = await play.search(query, { limit: 1, source: { youtube: 'video' } });

  if (!results || results.length === 0) {
    return null;
  }

  const video = results[0];
  const track = {
    title: video.title,
    url: video.url,
    author: video.channel?.name || 'Desconocido',
    duration: video.durationRaw,
  };

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

module.exports = { getQueue, queues, addTrack, addTracks, playSong };
