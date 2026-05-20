module.exports = {
  name: 'help',
  description: 'Muestra todos los comandos disponibles',
  execute: async (message, args, client) => {
    const embed = {
      color: 0x0099ff,
      title: '🤖 Comandos disponibles',
      fields: [
        {
          name: '!play <canción>',
          value: 'Busca y reproduce una canción',
        },
        {
          name: '!pause',
          value: 'Pausa la música',
        },
        {
          name: '!resume',
          value: 'Reanuda la música',
        },
        {
          name: '!skip',
          value: 'Salta a la siguiente canción',
        },
        {
          name: '!stop',
          value: 'Detiene la música y limpia la cola',
        },
        {
          name: '!queue',
          value: 'Muestra la cola de reproducción',
        },
      ],
      footer: { text: 'Usa !help para ver este mensaje' },
    };

    message.reply({ embeds: [embed] });
  },
};
