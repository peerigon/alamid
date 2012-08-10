"use strict"; // run code in ES5 strict mode

var fs = require("fs"),
    toSrc = require("toSrc"),
    path = require("path"),
    _ = require("underscore"),
    config = require("../../core/config"),
    clientConfig = require("../../client/config.client.js");

function generateClientConfig () {

    _(clientConfig).each(function(value, key){
        if(config[key] !== undefined) {
            //assign value of server-config
            clientConfig[key] = config[key];
        }
    });

    return clientConfig;
}

function writeClientBootstrap() {

    var template,
        compileTemplate,
        bootstrapContent,
        renderData,
        clientConfig = generateClientConfig(),
        clientConfigAssignString = "";

    _(clientConfig).each(function(value, key) {
        clientConfigAssignString += "config." + key + " = " + toSrc(value) + "; \n";
    });

    renderData = {
        "clientConfig" : clientConfigAssignString
    };

    //read template file
    template = fs.readFileSync(path.resolve(__dirname, "../../templates/bootstrap.client.ejs"), "utf-8");
    compileTemplate = _.template(template);

    //do compile
    bootstrapContent = compileTemplate(renderData);

    //write back to file
    fs.writeFileSync(config.paths.bundle + "/bootstrap.js", bootstrapContent, "utf-8");
}

module.exports = writeClientBootstrap;