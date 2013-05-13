"use strict";

//https://github.com/flatiron/nconf
var nconf = require("nconf"),
    path = require("path"),
    fs = require("fs"),
    _ = require("underscore");

var defaultConfig = require("../defaults/defaultConfig.json"),
    extractConfig = require("./extractConfig.js"),
    booleanize = require("./booleanize.js");

var loadedConfig = null;

/**
 * Hierarchical load config from 1. ARGV, 2. ENV, 3. CWD/config.json or 4. default config
 * If you pass --config via ARGV or ENV, this file will be loaded as config.json instead of the default
 * Only values defined in config.json and default-alamid values can be overwritten by env
 *
 * **Examples:**
 * alamid --port 1234 : load default-config but overwrite port
 * alamid --config /your/path/to/config.json : load your own config json
 * alamid --config /your/path/to/config.json --port 1234 : load your own config.json but overwrite the port
 *
 * @return {Object} config
 */
function readConfig(part) {

    if (loadedConfig === null) {
        //cache it!
        loadedConfig = loadConfig();
    }

    if (part) {
        return extractConfig(loadedConfig, part);
    }

    return loadedConfig;
}

function loadConfig() {
    var conf = {},
        configDir,
        configFileName = "config.json",
        envConfigPath,
        configPath,
        log = readConfig.log,
        activeConfig;

    //working together with process.env.NODE_ENV
    if (process.env.env === undefined && process.env.NODE_ENV !== undefined) {
        process.env.env = process.env.NODE_ENV;
    }

    //parse args & env first
    nconf.argv()
        .env();

    //we prefer appDir, but use process.cwd as a fallback
    //TODO look at appDir, __dirname and process.cwd
    //TODO make this whole thing less messy
    //TODO add notification about which config was loaded
    configDir = nconf.get("server:appDir") || process.cwd();

    //load default config file if none is set
    if (nconf.get("server:config") === undefined) {

        configPath = configFileName;

        //load env-specific config if env is set
        if (nconf.get("env") !== undefined) {

            envConfigPath = "config/" + nconf.get("env") + "." + configFileName;

            //fallback to default config file if env-file doesn't exist
            if (fs.existsSync(envConfigPath)) {
                log("loading env-specific default config for env '" + nconf.get("env") + "'");
                configPath = envConfigPath;
            }
        }
    }
    //check if path to custom config was passed and load if set
    else {
        log("loading custom config as defined '" + nconf.get("server:config") + "'");
        configPath = path.normalize(nconf.get("server:config"));
    }

    log("trying to read config-file from CWD: " + configPath);
    configPath = path.normalize(configDir + "/" + configPath);

    if (fs.existsSync(configPath)) {

        log("config-file found");

        //we need this file to extract the keys from nconf
        activeConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        //at least the default config values have to be set.
        _(activeConfig).extend(defaultConfig);

        nconf.file({ file : configPath });
    }
    else {
        log("Config-file not found. Loading default config");
        activeConfig = defaultConfig;
    }

    //set defaults from included config.json
    nconf.defaults(defaultConfig);

    //Setting the node-env for other modules
    if (nconf.get("env") !== undefined && process.env.NODE_ENV === undefined) {
        process.env.NODE_ENV = nconf.get("env");
    }

    //read each value from the passedConfig (merged with default config)
    //this way we can hide env values that are not really wanted
    _(activeConfig).forEach(function forEachDefaultConfig(value, key) {
            conf[key] = nconf.get(key);
    });

    //convert bool-string to real booleans
    conf = booleanize(conf);

    //type was only needed for nconf
    delete conf.type;

    //TODO: maybe sanitize here
    //define sanitize for client & server
    //i.e. for routes
    return conf;
}

readConfig.log = console.log;   // expose log-property so the logging behaviour can be changed externally

module.exports = readConfig;