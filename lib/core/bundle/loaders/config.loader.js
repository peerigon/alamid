"use strict";

var fs = require("fs"),
    path = require("path"),
    _ = require("underscore"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/config.client.ejs"), "utf8")),
    readConfig = require("../../config/readConfig.js");

function configLoader() {
    this.cacheable();

    return template({
        clientConfig: readConfig("client")
    });
}

module.exports = configLoader;