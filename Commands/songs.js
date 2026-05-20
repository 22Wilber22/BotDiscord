const ytpl = require('@distube/ytpl');

function limpiarNombre(titulo) {
  let nombre = titulo;
  // Extraer artista y canción si tiene formato "Artista - Canción"
  const partes = nombre.split(' - ');
  let artista = '';
  let cancion = '';

  if (partes.length >= 2) {
    artista = partes[0].trim();
    cancion = partes.slice(1).join(' - ').trim();
  } else {
    cancion = nombre;
  }

  // Limpiar la canción
  cancion = cancion
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\{.*?\}/g, '')
    .replace(/["""“”]/g, '')
    .replace(/\b(ft\.?|feat\.?|featuring)\b.*/i, '')
    .replace(/official\s*(video|audio|music|lyric|lyrics|mv|hd|4k)?\s*/gi, '')
    .replace(/\|.*/g, '')
    .replace(/No\.\d+/g, '')
    .replace(/HQ|HD|4K/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Limpiar cancion extras
  cancion = cancion
    .replace(/\b(remix|cover|live|acoustic|version|edit)\b/gi, '')
    .replace(/--.*?--/g, '')
    .replace(/M\/V/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Limpiar artista
  artista = artista
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\b(ft\.?|feat\.?|featuring)\b.*/i, '')
    .replace(/VALORANT|Arcane|League of Legends/gi, '')
    .replace(/,\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (artista && cancion) {
    return `${artista} ${cancion}`;
  }
  return cancion || artista || titulo.trim();
}

module.exports = {
  name: 'songs',
  description: 'Muestra los nombres de las canciones de una playlist de YouTube',
  execute: async (message, args) => {
    if (!args.length) {
      return message.reply('❌ Uso: !songs <URL de playlist de YouTube>');
    }

    const playlistUrl = args[0];
    const listMatch = playlistUrl.match(/list=([a-zA-Z0-9_-]+)/);

    if (!listMatch) {
      return message.reply('❌ URL inválida. Asegúrate de que tenga `list=` en el enlace');
    }

    const statusMsg = await message.reply('🔄 Leyendo playlist...');

    try {
      const playlist = await ytpl(listMatch[1], { limit: Infinity });
      const videos = playlist.items;

      if (!videos || videos.length === 0) {
        return await statusMsg.edit('❌ La playlist está vacía o es privada');
      }

      const nombres = videos.map(v => limpiarNombre(v.title)).filter(n => n.length > 0);

      const lista = nombres.map((n, i) => `${i + 1}. ${n}`).join('\n');

      if (lista.length > 1800) {
        const mitad = Math.ceil(nombres.length / 2);
        const parte1 = nombres.slice(0, mitad).map((n, i) => `${i + 1}. ${n}`).join('\n');
        const parte2 = nombres.slice(mitad).map((n, i) => `${mitad + i + 1}. ${n}`).join('\n');

        await statusMsg.edit(`🎵 **${playlist.title}** - ${nombres.length} canciones:\n\n${parte1}`);
        await message.channel.send(parte2);
      } else {
        await statusMsg.edit(`🎵 **${playlist.title}** - ${nombres.length} canciones:\n\n${lista}`);
      }

      const grupos = [];
      for (let i = 0; i < nombres.length; i += 5) {
        grupos.push(nombres.slice(i, i + 5));
      }

      await message.channel.send('📋 **Copia y pega estos comandos:**');
      for (const grupo of grupos) {
        await message.channel.send(`\`!addmultiple ${grupo.join(', ')}\``);
      }

    } catch (error) {
      console.error('Error:', error);
      await statusMsg.edit('❌ Error al leer la playlist. Verifica que sea pública.');
    }
  },
};
