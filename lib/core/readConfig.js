"use strict";

//https://github.com/flatiron/nconf
var nconf = require("nconf"),
    path = require("path"),
    _ = require("underscore");

var defaultConfig = require(__dirname + "/" + "config.json");

/**
 * Hierarchical load config from 1. ARGV, 2. ENV, 3. CWD/config.json or 4. default config
 * If you pass --config via ARGV or ENV, this file will be loaded as config.json instead of the default
 *
 * **Examples:**
 * alamid --port 1234 : load default-config but overwrite port
 * alamid --config /your/path/to/config.json : load your own config json
 * alamid --config /your/path/to/config.json --port 1234 : load your own config.json but overwrite the port
 *
 * @return {Object} config
 */
module.exports = function readConfig() {

    var conf = {};
    var configPath;

    //parse args & env first
    nconf.argv()
         .env();

    //load default config file if none is set
    if (nconf.get("config") === undefined) {
        configPath = path.normalize(process.cwd() + "/" + "config.json");
        console.log("Trying to read from CWD: " + configPath);
    }
    //check if path to custom config was passed and load if set
    else {
        configPath = path.normalize(process.cwd() + "/" + nconf.get("config"));
        console.log("Trying to read given config-file: " + configPath);
    }

    nconf.file({ file: configPath });
    //set defaults from included config.json
    nconf.defaults(defaultConfig);

    //read each value from nconf and create confObject
    _(defaultConfig).forEach(function forEachDefaultConfig(value, key) {
       conf[key] = nconf.get(key);
    });

    return conf;
};
