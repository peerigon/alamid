"use strict"; // run code in ES5 strict mode

var fs = require("fs"),
    toSrc = require("toSrc"),
    path = require("path"),
    _ = require("underscore"),
    clientConfig = require("../../client/config.client.js"),
    template = _.template(fs.readFileSync(__dirname + "/templates/bootstrap.client.ejs", "utf8"));

function generateClientConfig(config) {

    // Copies only the values of clientConfig so we don't expose confidential data
    _(clientConfig).each(function copyConfigValue(value, key){
        clientConfig[key] = config[key];
    });

    return clientConfig;
}

function renderBootstrapClient(config) {
    var clientConfig = generateClientConfig(config);

    return template({
        clientConfig: clientConfig,
        toSrc: toSrc
    });
}

module.exports = renderBootstrapClient;