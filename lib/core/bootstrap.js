"use strict"; // run code in ES5 strict mode

var config = require("./config"),
    logger = require("./logger"),
    log = logger.get("core"),
    collectServices = require("./collectServices.js"),
    services = require("../server/services.js");

function populateServices(callback) {
    collectServices(config.appPath, function onCollectServicesCallback(err, collectedServices) {
        services.services = collectedServices;
        callback(err, collectedServices);
    });
}

module.exports = function bootstrap() {

    log.info("Bootstrap: START");

    //TODO sanitize if everything is there: important dirs/files etc.

    //check services
    log.info("Populating Services...");
    populateServices(function(err, services) {
        log.info("Services", services);
    });

};
