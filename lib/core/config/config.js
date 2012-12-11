"use strict";

var readConfig = require("./readConfig.js"),
    sanitizeConfig = require("./sanitizeConfig.js");

readConfig.log = function(msg){ };
sanitizeConfig.log = function(msg){ };

var config = readConfig();

//check sanity of config
config = sanitizeConfig(config);

module.exports = config;