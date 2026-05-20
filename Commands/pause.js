const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'pause',
  description: 'Pausa la música',
  execute: async (message) => {
    const player = useMainPlayer();
    const queue = player.nodes.get(message.guild);

    if (!queue || !queue.isPlaying()) {
      return message.reply('❌ No hay música reproduciéndose');
    }

    queue.node.setPaused(true);
    message.reply('⏸️ Música pausada');
  },
};
