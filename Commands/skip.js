const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'skip',
  description: 'Salta a la siguiente canción',
  execute: async (message) => {
    const player = useMainPlayer();
    const queue = player.nodes.get(message.guild);

    if (!queue || !queue.isPlaying()) {
      return message.reply('❌ No hay música reproduciéndose');
    }

    const oldTrack = queue.currentTrack;
    queue.node.skip();
    message.reply(`⏭️ Saltado: **${oldTrack.title}**`);
  },
};
