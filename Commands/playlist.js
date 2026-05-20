const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'playlist',
  description: 'Reproduce una playlist o radio de YouTube',
  execute: async (message, args) => {
    if (!message.member.voice.channel) {
      return message.reply('❌ Debes estar en un canal de voz');
    }

    if (!args.length) {
      return message.reply('❌ Necesitas proporcionar una URL de playlist o radio de YouTube');
    }

    const playlistUrl = args[0];

    if (!playlistUrl.includes('youtube.com') && !playlistUrl.includes('youtu.be')) {
      return message.reply('❌ Debes proporcionar un enlace válido de YouTube');
    }

    try {
      const player = useMainPlayer();
      message.reply('🔄 Cargando playlist/radio...');

      // Detectar si es una radio o playlist
      const isRadio = playlistUrl.includes('list=RD');
      const typeText = isRadio ? 'radio' : 'playlist';

      const searchResult = await player.search(playlistUrl, {
        requestedBy: message.author,
      });

      if (!searchResult || searchResult.tracks.length === 0) {
        return message.reply(`❌ No se pudo cargar la ${typeText}. Verifica que sea pública y el URL sea correcto.`);
      }

      const queue = player.nodes.create(message.guild, {
        metadata: message.channel,
      });

      if (!queue.connection) await queue.connect(message.member.voice.channel);

      const tracks = searchResult.tracks;
      queue.addTracks(tracks);

      if (!queue.isPlaying()) await queue.node.play();

      message.reply(`✅ ${typeText.charAt(0).toUpperCase() + typeText.slice(1)} cargada: **${tracks.length}** canciones agregadas`);
    } catch (error) {
      console.error('Error al cargar playlist:', error.message);
      message.reply('❌ Error al cargar la playlist/radio. Intenta con una URL diferente.');
    }
  },
};
