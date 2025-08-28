const { Client, Message, MessageMedia, MessageTypes } = require('whatsapp-web.js');
const { Contact } = require('whatsapp-web.js/src/structures');

/**
 * 
 * @param {Client} client 
 */
module.exports = function main(client){
    
    client.on('message_create',
    /**
     * @param {Message} msg
     * @param {Message} ack
     */
    async (msg, ack) => {
        
        const [cmd, ...args] = msg.body.split(" ");

        if(msg.body == 'reload')
            client.emit('reloadPlugins');            
    
        if(cmd == 'reload' && args[0]){
            client.emit('reloadPlugin', args[0]);
        }
    });
}