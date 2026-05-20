const { getQueue } = require('../musicQueue');

module.exports = {
  name: 'resume',
  description: 'Reanuda la música pausada',
  execute: async (message) => {
    const queue = getQueue(message.guild.id);

    if (!queue.player) {
      return message.reply('❌ No hay música en la cola');
    }

    queue.player.unpause();
    message.reply('▶️ Música reanudada');
  },
};
