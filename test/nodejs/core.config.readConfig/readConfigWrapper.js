"use strict";

//simple wrapper to expose the JSON-config-data
var readConfig = require("../../lib/core/config/readConfig");

console.log(JSON.stringify(readConfig()));