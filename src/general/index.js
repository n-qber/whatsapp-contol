const { Client, MessageAck } = require('whatsapp-web.js');


/**
 * 
 * @param {Client} client 
 */
module.exports = function main(client){


    client.on('message_create', async message => {
		try{
			if(message.body === "!ping")
				await client.sendMessage((await message.getChat()).id._serialized, "pong");
		}catch(err)
		{
			console.error(err);
		}
    });
}
