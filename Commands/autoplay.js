const { useMainPlayer } = require('discord-player');

module.exports = {
  name: 'autoplay',
  description: 'Activa/desactiva autoplay (canciones similares automáticas)',
  execute: async (message) => {
    const player = useMainPlayer();
    const queue = player.nodes.get(message.guild);

    if (!queue) {
      return message.reply('❌ No hay música en la cola');
    }

    const autoplayStatus = queue.repeatMode === 2;

    if (autoplayStatus) {
      queue.setRepeatMode(0);
      message.reply('❌ Autoplay desactivado');
    } else {
      queue.setRepeatMode(2);
      message.reply('✅ Autoplay activado - Se reproducirán canciones similares automáticamente');
    }
  },
};
