const { getQueue, queues } = require('../musicQueue');

module.exports = {
  name: 'stop',
  description: 'Detiene la música y limpia la cola',
  execute: async (message) => {
    const queue = getQueue(message.guild.id);

    if (!queue.current) {
      return message.reply('❌ No hay música reproduciéndose');
    }

    queue.tracks = [];
    queue.current = null;
    if (queue.player) queue.player.stop();
    if (queue.connection) queue.connection.destroy();
    queues.delete(message.guild.id);

    message.reply('⏹️ Música detenida y cola limpiada');
  },
};
