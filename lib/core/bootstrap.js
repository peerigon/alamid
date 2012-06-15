"use strict"; // run code in ES5 strict mode

var config = require("./config"),
    logger = require("../shared/logger.js"),
    log = logger.get("core"),
    collectServices = require("./collectServices.js"),
    services = require("../server/services.js"),
    startServer = require("../server/startServer.js");

function populateServices(callback) {
    collectServices(config.paths.services, function onCollectServicesCallback(err, collectedServices) {
        services.services = collectedServices;
        callback(err, collectedServices);
    });
}

module.exports = function bootstrap() {

    log.info("Bootstrap: START");

    //TODO sanitize if everything is there: important dirs/files etc.

    //check services
    log.info("Loading Services...");
    populateServices(function(err, services) {
        log.info("Services ready.");
    });


    //start server
    startServer(config.port);

};
