"use strict"; // run code in ES5 strict mode

var fs = require("fs"),
    path = require("path"),
    toSrc = require("toSrc"),
    _ = require("underscore"),
    clientConfig = require("../../../client/config.client.js"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/bootstrap.client.ejs"), "utf8"));

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
        toSrc: toSrc,
        pageRegistry: path.join(__dirname, "..", "pageRegistry.loader.js") + "!?",
        serviceRegistry: path.join(__dirname, "..", "serviceRegistry.loader.js") + "!?",
        schemaRegistry: path.join(__dirname, "..", "schemaRegistry.loader.js") + "!?",
        modelRegistry: path.join(__dirname, "..", "modelRegistry.loader.js") + "!?"
    });
}

module.exports = renderBootstrapClient;