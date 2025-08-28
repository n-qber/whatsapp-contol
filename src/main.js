const { Client, LocalAuth } = require('whatsapp-web.js');


// Initializes client
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: "cookies" }),
});

client.on('ready', () => {
    console.log("[*] Alive");
})

// In case authentication doesn't work
client.on('qr', qr => {

    // writes qrcode to stdout for scanning
    const qrcode = require('qrcode-terminal');
    qrcode.generate(qr, { small: true })

});


const CONFIG_PATH = './config';
const pluginListeners = {};


client.on('reloadPlugin', pluginName => {
    Object.keys(pluginListeners[pluginName]).forEach(eventName => {
        pluginListeners[pluginName][eventName].forEach(listener => {
            client.removeListener(eventName, listener);
        })
    });
    client.emit('loadPlugin', pluginName);
});


client.on('reloadPlugins', () => {
    // Unload all listeners
    Object.keys(pluginListeners).forEach(pluginName => {
        Object.keys(pluginListeners[pluginName]).forEach(eventName => {
            pluginListeners[pluginName][eventName].forEach(listener => {
                client.removeListener(eventName, listener);
            })
        })
    })
    // Unload config
    delete require.cache[require.resolve(CONFIG_PATH)];

    // Load everything back
    client.emit('loadPlugins');
});

client.on('loadPlugin', pluginName => {
    console.log(`[*] Starting load of ${pluginName} plugin`);
    pluginListeners[pluginName] = {};

    // Get all before listeners
    const allBeforeListeners = {};
    client.eventNames().forEach(eventName => {
        console.log(`[*] Getting listeners for ${eventName}`)
        allBeforeListeners[eventName] = client.listeners(eventName);
        console.log(`[*] Found ${allBeforeListeners[eventName].length} listeners`);
    });
    // Get all before listeners end

    // Run plugin
    console.log(`[*] Loading ${pluginName} plugin`);
    try {
        const modulePath = `./${pluginName}/index`;
        delete require.cache[require.resolve(modulePath)];
        require(modulePath)(client);
        console.log(`[*] Loaded ${pluginName} plugin`);
    } catch (err) {
        console.log("[!] There was an error loading the plugin... skipping");
        console.log(err);
        return;
    }

    // Save only new listeners
    client.eventNames().forEach(eventName => {
        client.listeners(eventName).forEach(listener => {
            // If the listener didn't exist before
            if (!allBeforeListeners[eventName] || !allBeforeListeners[eventName].includes(listener)) {
                console.log(`[*] ${listener.name} from ${eventName} didn't exist before`);
                if (!pluginListeners[pluginName][eventName]) {
                    console.log(`[*] Creating ${eventName} array for ${pluginName} plugin`)
                    pluginListeners[pluginName][eventName] = [];
                }
                console.log(`[*] Adding ${listener.name} function to ${pluginName}:${eventName}`)
                pluginListeners[pluginName][eventName].push(listener);
            }
        });
    });

});

client.on('loadPlugins', () => {
    console.log("[*] Start to load plugins");
    const config = require(CONFIG_PATH);
    const plugins = ['essential', ...config.plugins];

    /*
    const oldListeners = client.listeners;
    // Import modules
    //require('./general/index')(client); // General module
    client.reloadPlugins = () => {
        client.removeAllListeners();
        client.addListener()
    }*/

    /*
    plugins.forEach(pluginName => {
        console.log(`[*] Starting load of ${pluginName} plugin`);
        pluginListeners[pluginName] = {};

        // Get all before listeners
        const allBeforeListeners = {};
        client.eventNames().forEach(eventName => {
            console.log(`[*] Getting listeners for ${eventName}`)
            allBeforeListeners[eventName] = client.listeners(eventName);
            console.log(`[*] Found ${allBeforeListeners[eventName].length} listeners`);
        });
        // Get all before listeners end

        // Run plugin
        console.log(`[*] Loading ${pluginName} plugin`);
        try {
            const modulePath = `./${pluginName}/index`;
            delete require.cache[require.resolve(modulePath)];
            require(modulePath)(client);
            console.log(`[*] Loaded ${pluginName} plugin`);
        } catch (err) {
            console.log("[!] There was an error loading the plugin... skipping");
            console.log(err);
            return;
        }

        // Save only new listeners
        client.eventNames().forEach(eventName => {
            client.listeners(eventName).forEach(listener => {
                // If the listener didn't exist before
                if (!allBeforeListeners[eventName] || !allBeforeListeners[eventName].includes(listener)) {
                    console.log(`[*] ${listener.name} from ${eventName} didn't exist before`);
                    if (!pluginListeners[pluginName][eventName]) {
                        console.log(`[*] Creating ${eventName} array for ${pluginName} plugin`)
                        pluginListeners[pluginName][eventName] = [];
                    }
                    console.log(`[*] Adding ${listener.name} function to ${pluginName}:${eventName}`)
                    pluginListeners[pluginName][eventName].push(listener);
                }
            });
        });

    });
    */
    plugins.forEach(pluginName => client.emit('loadPlugin', pluginName));
});





client.initialize().then(() => {
    console.log("[*] Lib has started!");
    client.emit('loadPlugins');
});
