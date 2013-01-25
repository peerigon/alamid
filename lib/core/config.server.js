"use strict";

var readConfig = require("./config/readConfig.js"),
    sanitizeConfig = require("./config/sanitizeConfig.js");

readConfig.log = function(msg){ };
sanitizeConfig.log = function(msg){ };

var config = readConfig("server");

//check sanity of config
config = sanitizeConfig(config);

module.exports = config;