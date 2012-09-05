"use strict";

var fs = require("fs"),
    path = require("path");

var config = require("../shared/config"),
    log = require("../shared/logger.js").get("server"),
    appSessionConfig = path.resolve(config.paths.app, "./session.js");

log.debug("looking for session at: " + appSessionConfig);

if(fs.existsSync(appSessionConfig)) {
    log.debug("loading session-config at: " + appSessionConfig);
    module.exports = require(appSessionConfig);
}
else {
    log.debug("no session-config found. Loading default config instead!");
    module.exports = require("../core/defaults/defaultSession.js");
}
