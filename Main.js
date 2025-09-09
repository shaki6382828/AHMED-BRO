// =======================================================
//
//          CYBER-FCA BOT CORE SCRIPT
//          DEVELOPER: SHAHADAT
//
// =======================================================

// --- DEPENDENCIES ---
const moment = require('moment-timezone');
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } = require('fs-extra');
const { join, resolve } = require('path');
const { execSync } = require('child_process');
const logger = require('./utils/log');
const login = require('cyber-fca'); // Likely a custom Facebook API wrapper
const axios = require('axios');

// --- PACKAGE & MODULE INFORMATION ---
const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
const listbuiltinModules = require('module').builtinModules;

// --- ASCII ART FOR BOT STARTUP ---
const BOT_ART = `
█████╗░██╗░░░██╗██████╗░█████╗░██╗░░██╗██████╗░
██╔══██╗██║░░░██║██╔══██╗██╔══██╗██║░██╔╝██╔══██╗
███████║██║░░░██║██████╔╝██║░░██║█████═╝░██║░░██║
██╔══██║██║░░░██║██╔══██╗██║░░██║██╔═██╗░██║░░██║
██║░░██║╚██████╔╝██║░░██║█████╔╝██║░╚██╗██████╔╝
╚═╝░░╚═╝░╚═════╝░╚═╝░░╚═╝╚════╝░╚═╝░░╚═╝╚═════╝░

\t\t\t\t\tSHAHADAT
`;

// --- GLOBAL VARIABLES INITIALIZATION ---
// These globals are used throughout the bot's modules.

// client: Core object for bot functionalities, commands, and events.
global.client = {
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    eventRegistered: [],
    handleSchedule: [],
    handleReaction: [],
    handleReply: [],
    mainPath: process.cwd(),
    configPath: '',
    // getTime: Utility function to get formatted time for 'Asia/Dhaka'.
    getTime: function (format) {
        switch (format) {
            case 'seconds': return '' + moment.tz('Asia/Dhaka').format('ss');
            case 'minutes': return '' + moment.tz('Asia/Dhaka').format('mm');
            case 'hours': return '' + moment.tz('Asia/Dhaka').format('HH');
            case 'date': return '' + moment.tz('Asia/Dhaka').format('DD');
            case 'month': return '' + moment.tz('Asia/Dhaka').format('MM');
            case 'year': return '' + moment.tz('Asia/Dhaka').format('YYYY');
            case 'fullHour': return '' + moment.tz('Asia/Dhaka').format('HH:mm:ss');
            case 'fullDate': return '' + moment.tz('Asia/Dhaka').format('DD/MM/YYYY');
            case 'fullTime': return '' + moment.tz('Asia/Dhaka').format('HH:mm:ss DD/MM/YYYY');
        }
    }
};

// data: Holds dynamic data like thread info, user names, bans, etc.
global.data = {
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    threadAllowNSFW: [],
    allUserID: [],
    allCurrenciesID: [],
    allThreadID: []
};

// --- GLOBAL CONFIGURATION & LANGUAGE ---
global.config = {}; // Will be populated from config.json
global.language = {}; // Will be populated from language file
global.modules = {}; // For caching required modules
global.configModule = {}; // For module-specific configs
global.account = []; // Unused in this snippet
global.FCAOption = {}; // Options for the FCA login

// =======================================================
//                CONFIGURATION LOADING
// =======================================================

let configValue;
try {
    global.client.configPath = join(global.client.mainPath, 'config.json');
    configValue = require(global.client.configPath);
    logger.log('Found config.json, loading configuration...');
} catch (e) {
    const exampleConfigPath = join(global.client.mainPath, 'config.example.json');
    if (existsSync(exampleConfigPath)) {
        configValue = JSON.parse(readFileSync(exampleConfigPath));
        logger.log(`Couldn't find config.json, loading from ${exampleConfigPath}`);
    } else {
        return logger.error("config.json not found!");
    }
}

try {
    for (const key in configValue) {
        global.config[key] = configValue[key];
    }
    logger.log('Configuration loaded successfully!');
} catch (e) {
    return logger.error('Cannot load configuration from file.');
}

// Write the loaded config back to ensure format consistency
writeFileSync(global.client.configPath, JSON.stringify(global.config, null, 4), 'utf-8');

// =======================================================
//                 LANGUAGE FILE LOADING
// =======================================================

const langFilePath = `${__dirname}/languages/${global.config.language || 'en'}.lang`;
const langFileContent = readFileSync(langFilePath, { encoding: 'utf-8' }).split(/\r?\n|\r/);
const langData = langFileContent.filter(line => line && !line.startsWith('#'));

for (const item of langData) {
    const [itemKey, itemValue] = item.split('=').map(s => s.trim());
    const [head, key] = itemKey.split('.');
    const value = itemValue.replace(/\\n/gi, '\n');

    if (!global.language[head]) {
        global.language[head] = {};
    }
    global.language[head][key] = value;
}

// Global function for getting localized text
global.getText = function (...args) {
    const key = args[0];
    if (!global.language.hasOwnProperty(key)) {
        throw new Error(`${__filename} - Language key not found: ${key}`);
    }
    let text = global.language[key][args[1]];
    for (let i = args.length - 1; i > 1; i--) {
        const regEx = new RegExp(`%${i - 1}`, 'g');
        text = text.replace(regEx, args[i]);
    }
    return text;
};

// =======================================================
//                      BOT LOGIN
// =======================================================

let appState;
try {
    const appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || 'appstate.json'));
    appState = require(appStateFile);
    logger.log(global.getText('loader', 'foundPathAppstate'));
} catch (e) {
    return logger.error(global.getText('loader', 'notFoundPathAppstate'));
}

function onBot({ models }) {
    const loginOptions = { appState };
    
    login(loginOptions, async (err, api) => {
        if (err) {
            return logger.error(JSON.stringify(err), 'Login Error');
        }

        api.setOptions(global.config.FCAOption);
        writeFileSync(resolve(join(global.client.mainPath, global.config.APPSTATEPATH || 'appstate.json')), JSON.stringify(api.getAppState(), null, '\t'));

        global.client.api = api;
        global.config.version = '1.2.14'; // Set bot version
        global.client.timeStart = new Date().getTime();

        // --- Load Command Modules ---
        (function () {
            const commandPath = `${global.client.mainPath}/Script/commands/`;
            const commandFiles = readdirSync(commandPath).filter(file => file.endsWith('.js') && !global.config.commandDisabled.includes(file));

            for (const file of commandFiles) {
                try {
                    const command = require(join(commandPath, file));
                    
                    // Basic validation
                    if (!command.config || !command.run || !command.config.name) {
                        throw new Error(global.getText('loader', 'errorFormat'));
                    }
                    if (global.client.commands.has(command.config.name)) {
                        throw new Error(global.getText('loader', 'nameExist'));
                    }
                    if (command.config.dependencies && typeof command.config.dependencies === 'object') {
                        for (const depName in command.config.dependencies) {
                            try {
                                if (!listPackage.hasOwnProperty(depName) && !listbuiltinModules.includes(depName)) {
                                    logger.log(global.getText('loader', 'notFoundPackage', depName, command.config.name));
                                    execSync(`npm install --save ${depName}`, { stdio: 'inherit', env: process.env, shell: true, cwd: join(__dirname, 'nodemodules') });
                                }
                                require(depName);
                            } catch (e) {
                                throw new Error(global.getText('loader', 'cantInstallPackage', depName, command.config.name, e));
                            }
                        }
                        logger.log(global.getText('loader', 'loadedPackage', command.config.name));
                    }
                    
                    if (command.config.envConfig) {
                        // Handle module-specific configurations
                    }

                    if (command.onLoad) {
                        try {
                            command.onLoad({ api, models });
                        } catch (e) {
                            throw new Error(global.getText('loader', 'cantOnload', command.config.name, JSON.stringify(e)));
                        }
                    }

                    global.client.commands.set(command.config.name, command);
                    logger.log(global.getText('loader', 'successLoadModule', command.config.name));

                } catch (e) {
                    logger.error(global.getText('loader', 'failLoadModule', file, e));
                }
            }
        })();

        // --- Load Event Modules ---
        (function () {
            const eventPath = `${global.client.mainPath}/Script/events/`;
            const eventFiles = readdirSync(eventPath).filter(file => file.endsWith('.js') && !global.config.eventDisabled.includes(file));

            for (const file of eventFiles) {
                try {
                    const event = require(join(eventPath, file));

                    if (!event.config || !event.run) {
                         throw new Error(global.getText('loader', 'errorFormat'));
                    }
                    if (global.client.events.has(event.config.name)) {
                         throw new Error(global.getText('loader', 'nameExist'));
                    }
                    // Dependency installation logic similar to commands...
                    
                    if (event.onLoad) {
                         event.onLoad({ api, models });
                    }

                    global.client.events.set(event.config.name, event);
                    logger.log(global.getText('loader', 'successLoadModule', event.config.name));

                } catch(e) {
                    logger.error(global.getText('loader', 'failLoadModule', file, e));
                }
            }
        })();

        // --- Finalize Startup ---
        console.log(BOT_ART);
        logger.log(global.getText('loader', 'finishLoad', global.client.commands.size, global.client.events.size));
        logger.log(`Startup Time: ${( (Date.now() - global.client.timeStart) / 1000).toFixed()}s`);

        // Save final config state
        writeFileSync(global.client.configPath, JSON.stringify(global.config, null, 4), 'utf-8');
        
        // --- Start Listening for Events ---
        const listener = require('./includes/listen')({ api, models });

        function handleListen(err, event) {
            if (err) return logger.error(global.getText('loader', 'unhandledRejection', JSON.stringify(err)));
            if (['presence', 'typ', 'read_receipt'].some(type => type == event.type)) return;
            if (global.config.DeveloperMode === true) console.log(event);
            return listener(event);
        }

        global.listen = api.listenMqtt(handleListen);
        
        // This seems incomplete or a placeholder for a ban check
        // try { await checkBan(api); } catch (e) { return; }
        
        if (!global.checkBan) {
            logger.log(global.getText('database', 'notFoundNotice'), 'warning');
        }
    });
}

// =======================================================
//                  DATABASE CONNECTION
// =======================================================
(async () => {
    try {
        const { Sequelize, sequelize } = require('./includes/database');
        await sequelize.authenticate();
        
        const models = require('./includes/models')({ Sequelize, sequelize });
        logger.log(global.getText('database', 'successConnect'), '[ DATABASE ]');
        
        onBot({ models });

    } catch (error) {
        logger.error(global.getText('database', 'failConnect', JSON.stringify(error)), '[ DATABASE ]');
    }
})();

// --- GLOBAL ERROR HANDLER ---
process.on('unhandledRejection', (error, promise) => {
    // Intentionally empty to suppress crashes, though logging here is recommended.
    // console.error('Unhandled Rejection:', error);
});
      
