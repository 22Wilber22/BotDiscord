const { getQueue } = require('../musicQueue');

module.exports = {
  name: 'queue',
  description: 'Muestra la cola de canciones',
  execute: async (message) => {
    const queue = getQueue(message.guild.id);

    if (!queue.current && queue.tracks.length === 0) {
      return message.reply('❌ La cola está vacía');
    }

    let description = '';
    if (queue.current) {
      description += `▶️ **${queue.current.title}** - ${queue.current.author}\n\n`;
    }

    if (queue.tracks.length > 0) {
      const tracks = queue.tracks.slice(0, 10).map((track, index) => {
        return `${index + 1}. **${track.title}** - ${track.author}`;
      }).join('\n');
      description += tracks;
    }

    const embed = {
      color: 0x0099ff,
      title: '🎵 Cola de reproducción',
      description: description,
      footer: { text: `Total en cola: ${queue.tracks.length} canciones` },
    };

    message.reply({ embeds: [embed] });
  },
};
