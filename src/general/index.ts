import { Client, Message } from 'whatsapp-web.js';

/**
 * 
 * @param {Client} client 
 */
export default function main(client: Client){


    client.on('message_create', async (message: Message) => {
		if(message.body === "!ping")
			await client.sendMessage((await message.getChat()).id._serialized, "pong");
    });
}
