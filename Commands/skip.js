const { getQueue, playSong } = require('../musicQueue');

module.exports = {
  name: 'skip',
  description: 'Salta a la siguiente canción',
  execute: async (message) => {
    const queue = getQueue(message.guild.id);

    if (!queue.current) {
      return message.reply('❌ No hay música reproduciéndose');
    }

    const oldTrack = queue.current;
    queue.player.stop();
    message.reply(`⏭️ Saltado: **${oldTrack.title}**`);
  },
};
