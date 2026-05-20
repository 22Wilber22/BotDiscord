const { getQueue } = require('../musicQueue');

module.exports = {
  name: 'pause',
  description: 'Pausa la música',
  execute: async (message) => {
    const queue = getQueue(message.guild.id);

    if (!queue.player || !queue.current) {
      return message.reply('❌ No hay música reproduciéndose');
    }

    queue.player.pause();
    message.reply('⏸️ Música pausada');
  },
};
