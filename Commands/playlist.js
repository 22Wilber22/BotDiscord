const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'playlist',
  description: 'Reproduce una playlist de YouTube',
  execute: async (message, args) => {
    if (!message.member.voice.channel) {
      return message.reply('❌ Debes estar en un canal de voz');
    }

    if (!args.length) {
      return message.reply('❌ Necesitas proporcionar una URL de playlist de YouTube');
    }

    const playlistUrl = args[0];

    if (!playlistUrl.includes('youtube.com') && !playlistUrl.includes('youtu.be')) {
      return message.reply('❌ Debes proporcionar un enlace válido de YouTube');
    }

    try {
      const player = useMainPlayer();
      message.reply('🔄 Cargando playlist...');

      const searchResult = await player.search(playlistUrl, {
        requestedBy: message.author,
      });

      if (!searchResult || searchResult.tracks.length === 0) {
        return message.reply('❌ No se pudo cargar la playlist');
      }

      const queue = player.nodes.create(message.guild, {
        metadata: message.channel,
      });

      if (!queue.connection) await queue.connect(message.member.voice.channel);

      const tracks = searchResult.tracks;
      queue.addTracks(tracks);

      if (!queue.isPlaying()) await queue.node.play();

      message.reply(`✅ Playlist cargada: **${tracks.length}** canciones agregadas`);
    } catch (error) {
      console.error('Error:', error);
      message.reply('❌ Error al cargar la playlist');
    }
  },
};
