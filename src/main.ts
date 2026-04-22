import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

// Initializes client
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: "cookies" }),
});

client.on('ready', () => {
    console.log("[*] Alive");
})

// In case authentication doesn't work
client.on('qr', (qr: string) => {

    // writes qrcode to stdout for scanning
    qrcode.generate(qr, { small: true })

});


const CONFIG_PATH = './config';
const pluginListeners: { [key: string]: { [key: string]: Function[] } } = {};


client.on('reloadPlugin', (pluginName: string) => {
    if (pluginListeners[pluginName]) {
        Object.keys(pluginListeners[pluginName]).forEach(eventName => {
            pluginListeners[pluginName][eventName].forEach(listener => {
                client.removeListener(eventName, listener as any);
            })
        });
    }
    client.emit('loadPlugin', pluginName);
});


client.on('reloadPlugins', () => {
    // Unload all listeners
    Object.keys(pluginListeners).forEach(pluginName => {
        Object.keys(pluginListeners[pluginName]).forEach(eventName => {
            pluginListeners[pluginName][eventName].forEach(listener => {
                client.removeListener(eventName, listener as any);
            })
        })
    })
    // Unload config
    try {
        const resolvedConfigPath = require.resolve(CONFIG_PATH);
        delete require.cache[resolvedConfigPath];
    } catch (e) {}

    // Load everything back
    client.emit('loadPlugins');
});

client.on('loadPlugin', (pluginName: string) => {
    console.log(`[*] Starting load of ${pluginName} plugin`);
    pluginListeners[pluginName] = {};

    // Get all before listeners
    const allBeforeListeners: { [key: string]: Function[] } = {};
    client.eventNames().forEach(eventName => {
        const evt = eventName.toString();
        console.log(`[*] Getting listeners for ${evt}`)
        allBeforeListeners[evt] = client.listeners(eventName) as Function[];
        console.log(`[*] Found ${allBeforeListeners[evt].length} listeners`);
    });
    // Get all before listeners end

    // Run plugin
    console.log(`[*] Loading ${pluginName} plugin`);
    try {
        const modulePath = `./${pluginName}/index`;
        try {
            const resolvedModulePath = require.resolve(modulePath);
            delete require.cache[resolvedModulePath];
        } catch (e) {}
        
        const plugin = require(modulePath);
        (plugin.default || plugin)(client);
        console.log(`[*] Loaded ${pluginName} plugin`);
    } catch (err) {
        console.log("[!] There was an error loading the plugin... skipping");
        console.log(err);
        return;
    }

    // Save only new listeners
    client.eventNames().forEach(eventName => {
        const evt = eventName.toString();
        (client.listeners(eventName) as Function[]).forEach(listener => {
            // If the listener didn't exist before
            if (!allBeforeListeners[evt] || !allBeforeListeners[evt].includes(listener)) {
                console.log(`[*] ${listener.name} from ${evt} didn't exist before`);
                if (!pluginListeners[pluginName][evt]) {
                    console.log(`[*] Creating ${evt} array for ${pluginName} plugin`)
                    pluginListeners[pluginName][evt] = [];
                }
                console.log(`[*] Adding ${listener.name} function to ${pluginName}:${evt}`)
                pluginListeners[pluginName][evt].push(listener);
            }
        });
    });

});

client.on('loadPlugins', () => {
    console.log("[*] Start to load plugins");
    const configModule = require(CONFIG_PATH);
    const config = configModule.default || configModule;
    const plugins = ['essential', ...config.plugins];

    /*
    const oldListeners = (client as any).listeners;
    // Import modules
    //require('./general/index')(client); // General module
    (client as any).reloadPlugins = () => {
        client.removeAllListeners();
        // client.addListener()
    }
    */

    /*
    plugins.forEach(pluginName => {
        console.log(`[*] Starting load of ${pluginName} plugin`);
        pluginListeners[pluginName] = {};

        // Get all before listeners
        const allBeforeListeners: { [key: string]: Function[] } = {};
        client.eventNames().forEach(eventName => {
            const evt = eventName.toString();
            console.log(`[*] Getting listeners for ${evt}`)
            allBeforeListeners[evt] = client.listeners(eventName) as Function[];
            console.log(`[*] Found ${allBeforeListeners[evt].length} listeners`);
        });
        // Get all before listeners end

        // Run plugin
        console.log(`[*] Loading ${pluginName} plugin`);
        try {
            const modulePath = `./${pluginName}/index`;
            try {
                const resolvedModulePath = require.resolve(modulePath);
                delete require.cache[resolvedModulePath];
            } catch (e) {}
            
            const plugin = require(modulePath);
            (plugin.default || plugin)(client);
            console.log(`[*] Loaded ${pluginName} plugin`);
        } catch (err) {
            console.log("[!] There was an error loading the plugin... skipping");
            console.log(err);
            return;
        }

        // Save only new listeners
        client.eventNames().forEach(eventName => {
            const evt = eventName.toString();
            (client.listeners(eventName) as Function[]).forEach(listener => {
                // If the listener didn't exist before
                if (!allBeforeListeners[evt] || !allBeforeListeners[evt].includes(listener)) {
                    console.log(`[*] ${listener.name} from ${evt} didn't exist before`);
                    if (!pluginListeners[pluginName][evt]) {
                        console.log(`[*] Creating ${evt} array for ${pluginName} plugin`)
                        pluginListeners[pluginName][evt] = [];
                    }
                    console.log(`[*] Adding ${listener.name} function to ${pluginName}:${evt}`)
                    pluginListeners[pluginName][evt].push(listener);
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
