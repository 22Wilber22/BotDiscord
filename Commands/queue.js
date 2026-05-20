const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'queue',
  description: 'Muestra la cola de canciones',
  execute: async (message) => {
    const player = useMainPlayer();
    const queue = player.nodes.get(message.guild);

    if (!queue || queue.tracks.length === 0) {
      return message.reply('❌ La cola está vacía');
    }

    const tracks = queue.tracks.slice(0, 10).map((track, index) => {
      return `${index + 1}. **${track.title}** - ${track.author}`;
    }).join('\n');

    const embed = {
      color: 0x0099ff,
      title: '🎵 Cola de reproducción',
      description: tracks,
      footer: { text: `Total: ${queue.tracks.length} canciones` },
    };

    message.reply({ embeds: [embed] });
  },
};
