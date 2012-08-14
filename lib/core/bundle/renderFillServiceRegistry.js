"use strict"; // run code in ES5 strict mode

var collectServices = require("../../core/collect/collectServices.js"),
    _ = require("underscore"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(__dirname + "/templates/fillServiceRegistry.ejs", "utf8"));

function renderFillServiceRegistry(servicesPath) {
    var services = collectServices(servicesPath);

    return template({
        services: services
    });
}

module.exports = renderFillServiceRegistry;