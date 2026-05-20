# 🎵 Discord Music Bot

Un bot de música para Discord que busca y reproduce canciones de **YouTube**.

## 📋 Requisitos

- Node.js 16+
- Una cuenta de Discord
- Token de bot de Discord

## 🚀 Configuración

### 1. Token del Bot

Ve a [Discord Developer Portal](https://discord.com/developers/applications) y:
1. Crea una nueva aplicación
2. Genera un token en la sección "Bot"
3. Copia el token en el archivo `.env`:

```env
DISCORD_TOKEN=tu_token_aqui
DISCORD_CLIENT_ID=tu_client_id_aqui
```

### 2. Permisos del Bot

En Discord Developer Portal, ve a OAuth2 > URL Generator y selecciona:
- `bot`
- `Send Messages`
- `Embed Links`
- `Connect` (voz)
- `Speak` (voz)

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Ejecutar el Bot

```bash
node index.js
```

## 🎮 Comandos

| Comando | Descripción |
|---------|-------------|
| `!play <canción>` | Busca y reproduce una canción |
| `!pause` | Pausa la música |
| `!resume` | Reanuda la música |
| `!skip` | Salta a la siguiente canción |
| `!stop` | Detiene la música |
| `!queue` | Muestra la cola de reproducción |
| `!playlist <URL>` | Reproduce una playlist de YouTube |
| `!autoplay` | Activa/desactiva autoplay automático |
| `!help` | Muestra todos los comandos |

## 📝 Notas

- El bot necesita estar en el mismo canal de voz que tú
- Las canciones se buscan en YouTube por defecto
- El prefijo de comandos es `!`

## 🤝 Soporte

Si encuentras problemas, verifica que:
1. El bot tiene permisos en el servidor
2. El token es válido
3. El bot está en un canal de voz

¡Disfruta la música! 🎶
