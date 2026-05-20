const { addTrack } = require('../musicQueue');

module.exports = {
  name: 'play',
  description: 'Reproduce una canción de YouTube',
  execute: async (message, args) => {
    if (!message.member.voice.channel) {
      return message.reply('❌ Debes estar en un canal de voz');
    }

    if (!args.length) {
      return message.reply('❌ Necesitas decir el nombre de la canción');
    }

    const cancionNombre = args.join(' ');

    try {
      const track = await addTrack(
        message.guild.id,
        message.member.voice.channel,
        message.channel,
        cancionNombre
      );

      if (!track) {
        return message.reply(`❌ No encontré ninguna canción para: ${cancionNombre}`);
      }

      message.reply(`✅ Reproduciendo: **${track.title}** de **${track.author}**`);
    } catch (error) {
      console.error('Error:', error);
      message.reply('❌ Error al buscar o reproducir la canción');
    }
  },
};
