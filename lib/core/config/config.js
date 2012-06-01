"use strict";

var readConfig = require("./readConfig.js"),
    sanitizeConfig = require("./sanitizeConfig.js");

//read first
var config = readConfig();
//sanitize, initialize and export secondly
module.exports = sanitizeConfig(config);