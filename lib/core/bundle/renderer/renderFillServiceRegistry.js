"use strict"; // run code in ES5 strict mode

var collectServices = require("../../collect/collectServices.js"),
    paths = require("../../../shared/config").paths,
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/fillServiceRegistry.ejs"), "utf8"));

function renderFillServiceRegistry(rootPath, servicesPath) {

    var services = collectServices(servicesPath);

    return template({
        rootPath : rootPath,
        services: services.client
    });
}

module.exports = renderFillServiceRegistry;