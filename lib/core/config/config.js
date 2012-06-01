"use strict";

var readConfig = require("./readConfig.js"),
    sanitizeConfig = require("./sanitizeConfig.js");

// 1. read config
var config = readConfig();

// 2. sanitize
config = sanitizeConfig(config);

// 3. print config
console.log("=== CONFIG =================================================================================");
console.log(config);
console.log("============================================================================================");

// 4. export
module.exports = config;