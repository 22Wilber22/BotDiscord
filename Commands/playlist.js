const play = require('play-dl');
const ytpl = require('@distube/ytpl');
const { addTracks } = require('../musicQueue');

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
    const listMatch = playlistUrl.match(/list=([a-zA-Z0-9_-]+)/);

    if (!listMatch) {
      return message.reply('❌ URL inválida. Asegúrate de que tenga `list=` en el enlace');
    }

    const statusMsg = await message.reply('🔄 Cargando playlist...');

    try {
      const playlist = await ytpl(listMatch[1], { limit: Infinity });
      const videos = playlist.items;

      if (!videos || videos.length === 0) {
        return await statusMsg.edit('❌ La playlist está vacía o es privada');
      }

      await statusMsg.edit(`🔄 **${playlist.title}** - Cargando ${videos.length} canciones...`);

      const tracks = videos.map(v => ({
        title: v.title,
        url: v.url,
        author: v.author?.name || 'Desconocido',
        duration: v.duration,
      }));

      await addTracks(
        message.guild.id,
        message.member.voice.channel,
        message.channel,
        tracks
      );

      await statusMsg.edit(`✅ **${playlist.title}** cargada: **${tracks.length}** canciones`);
    } catch (error) {
      console.error('Error:', error);
      await statusMsg.edit('❌ Error al cargar la playlist. Verifica que sea pública.');
    }
  },
};
