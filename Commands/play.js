const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'play',
  description: 'Reproduce una canción',
  execute: async (message, args) => {
    if (!message.member.voice.channel) {
      return message.reply('❌ Debes estar en un canal de voz');
    }

    if (!args.length) {
      return message.reply('❌ Necesitas decir el nombre de la canción');
    }

    const player = useMainPlayer();
    const cancionNombre = args.join(' ');

    try {
      const searchResult = await player.search(cancionNombre, {
        requestedBy: message.author,
      });

      if (!searchResult || searchResult.tracks.length === 0) {
        return message.reply(`❌ No encontré ninguna canción para: ${cancionNombre}`);
      }

      const queue = player.nodes.create(message.guild, {
        metadata: message.channel,
      });

      if (!queue.connection) await queue.connect(message.member.voice.channel);

      const track = searchResult.tracks[0];
      queue.addTrack(track);

      if (!queue.isPlaying()) await queue.node.play();

      message.reply(`✅ Reproduciendo: **${track.title}** de **${track.author}**`);
    } catch (error) {
      console.error('Error:', error);
      message.reply('❌ Error al buscar o reproducir la canción');
    }
  },
};