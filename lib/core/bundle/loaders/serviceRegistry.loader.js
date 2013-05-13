"use strict"; // run code in ES5 strict mode

var collectServices = require("../../collect/collectServices.js"),
    _ = require("underscore"),
    path = require("path"),
    fs = require("fs"),
    template = _.template(fs.readFileSync(path.resolve(__dirname, "../templates/populateServiceRegistry.ejs"), "utf8"));

function serviceRegistryLoader() {
    var alamidConfig = this.options.alamidConfig,
        services;

    if (alamidConfig) {
        services = collectServices(alamidConfig.paths.services);

        return template({
            services: services.client
        });
    }

    return "// Cannot generate populateServiceRegistry: The webpack options don't have a 'alamidConfig'-property";
}

module.exports = serviceRegistryLoader;