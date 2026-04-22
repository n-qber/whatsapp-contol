import { Client, Message } from 'whatsapp-web.js';

/**
 * 
 * @param {Client} client 
 */
export default function main(client: Client){
    
    client.on('message_create',
    /**
     * @param {Message} msg
     */
    async (msg: Message) => {
        
        const [cmd, ...args] = msg.body.split(" ");

        if(msg.body == 'reload')
            client.emit('reloadPlugins');            
    
        if(cmd == 'reload' && args[0]){
            client.emit('reloadPlugin', args[0]);
        }
    });
}
