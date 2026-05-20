const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'resume',
  description: 'Reanuda la música pausada',
  execute: async (message) => {
    const player = useMainPlayer();
    const queue = player.nodes.get(message.guild);

    if (!queue) {
      return message.reply('❌ No hay música en la cola');
    }

    if (queue.node.isPaused()) {
      queue.node.setPaused(false);
      message.reply('▶️ Música reanudada');
    } else {
      message.reply('❌ La música ya está reproduciéndose');
    }
  },
};
