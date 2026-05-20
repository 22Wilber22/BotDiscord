const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'stop',
  description: 'Detiene la música y limpia la cola',
  execute: async (message) => {
    const player = useMainPlayer();
    const queue = player.nodes.get(message.guild);

    if (!queue || !queue.isPlaying()) {
      return message.reply('❌ No hay música reproduciéndose');
    }

    queue.delete();
    message.reply('⏹️ Música detenida y cola limpiada');
  },
};
