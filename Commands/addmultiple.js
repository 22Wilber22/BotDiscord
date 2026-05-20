const { addTracks, searchYouTube } = require('../musicQueue');

module.exports = {
  name: 'addmultiple',
  description: 'Agrega múltiples canciones a la cola',
  execute: async (message, args) => {
    if (!message.member.voice.channel) {
      return message.reply('❌ Debes estar en un canal de voz');
    }

    if (!args.length) {
      return message.reply('❌ Uso: !addmultiple Canción 1, Canción 2, Canción 3');
    }

    const cancionesTexto = args.join(' ');
    const canciones = cancionesTexto.split(',').map(c => c.trim()).filter(c => c);

    if (canciones.length === 0) {
      return message.reply('❌ Debes proporcionar al menos una canción');
    }

    const statusMsg = await message.reply(`🔄 Buscando ${canciones.length} canción(es)...`);

    try {
      let agregadas = 0;
      const errores = [];
      const tracks = [];

      for (const cancionNombre of canciones) {
        try {
          const track = await searchYouTube(cancionNombre);
          if (track) {
            tracks.push(track);
            agregadas++;
          } else {
            errores.push(cancionNombre);
          }
        } catch (error) {
          errores.push(cancionNombre);
        }
      }

      if (tracks.length > 0) {
        await addTracks(
          message.guild.id,
          message.member.voice.channel,
          message.channel,
          tracks
        );
      }

      let respuesta = `✅ Se agregaron **${agregadas}** canción(es)`;
      if (errores.length > 0) {
        respuesta += `\n⚠️ No se encontraron: ${errores.join(', ')}`;
      }

      await statusMsg.edit(respuesta);
    } catch (error) {
      console.error('Error:', error);
      await statusMsg.edit('❌ Error al agregar las canciones');
    }
  },
};
