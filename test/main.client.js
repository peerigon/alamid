"use strict";

window.mocha.reporter(require("./testHelpers/MochaConsoleReporter.class.js"));

require("./client/main.client.js");
require("./shared/main.client.js");