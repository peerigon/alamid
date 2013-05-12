"use strict"; // run code in ES5 strict mode

var collectServices = require("../../collect/collectServices.js"),
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/populateServiceRegistry.ejs"), "utf8"));

function serviceRegistryLoader() {
    var services = collectServices(this.options.alamidConfig.paths.services);

    return template({
        services: services.client
    });
}

module.exports = serviceRegistryLoader;