# 📱 WhatsApp Control

A modular, plugin-based WhatsApp automation framework built with [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).

## 🚀 Features

- **Modular Architecture**: Easily extend functionality through a simple plugin system.
- **Hot Reloading**: Reload plugins or the entire configuration on-the-fly without restarting the bot.
- **Persistent Auth**: Uses `LocalAuth` to keep your session active across restarts.
- **TypeScript Support**: Built with TypeScript for a robust development experience.

## 🛠️ Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/whatsapp-control.git
    cd whatsapp-control
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure plugins**:
    Edit `src/config.ts` to enable or disable plugins.

4.  **Run the bot**:
    ```bash
    npm start
    ```

## 🔌 Plugin System

Plugins are located in the `src/` directory. Each plugin should export a default function that takes the `whatsapp-web.js` `Client` instance as an argument.

### Existing Plugins:
- **Essential**: Handles core commands like `reload` and `reload <plugin_name>` (cannot disable this plugin).
- **General**: Includes basic utility commands like `!ping`.

### Creating a New Plugin:
1.  Create a folder in `src/` (e.g., `src/my-plugin/`).
2.  Create an `index.ts` file inside it:
    ```typescript
    import { Client, Message } from 'whatsapp-web.js';

    export default function main(client: Client) {
        client.on('message_create', async (msg: Message) => {
            if (msg.body === '!hello') {
                await msg.reply('Hello from my new plugin!');
            }
        });
    }
    ```
3.  Add `'my-plugin'` to the `plugins` array in `src/config.ts`.

## 🔄 Commands
These commands are sent on your whatsapp chat through your phone
- `reload`: Reloads all plugins and the configuration file.
- `reload <plugin_name>`: Reloads a specific plugin. (essential plugin)
- `!ping`: Responds with "pong". (general plugin)
