"use strict";

var readConfig = require("./readConfig.js"),
    sanitizeConfig = require("./sanitizeConfig.js");

readConfig.log = function(msg){ };
sanitizeConfig.log = function(msg){ };

// 1. read config
var config = readConfig();

// 2. sanitize
config = sanitizeConfig(config);

// 3. print config
if (config.mode === "development") {
    console.log("=== CONFIG =================================================================================");
    console.log(config);
    console.log("============================================================================================");
}


// 4. export
module.exports = config;