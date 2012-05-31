"use strict";

//https://github.com/flatiron/nconf
var nconf = require("nconf"),
    path = require("path"),
    _ = require("underscore");

var defaultConfig = require(__dirname + "/" + "config.json");

module.exports = function(argv, env) {

    var conf = {};
    var configPath;

    //parse args & env first
    nconf.argv()
         .env();

    //load default config file if none is set
    if(nconf.get("config") === undefined){
        configPath = path.normalize(process.cwd() + "/" + "config.json");
        console.log("Trying to read from CWD: " + configPath);
    }
    //check if path to custom config was passed and load if set
    else{
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
