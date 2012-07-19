"use strict"; // run code in ES5 strict mode

var async = require("async"),
    _ = require("underscore"),
    toSrc = require('toSrc'),
    fs = require("fs"),
    path = require("path"),
    inspect = require("util").inspect;

var config = require("../../../lib/core/config"),
    clientConfig = require("../../../lib/client/config.client.js"),
    logger = require("../../../lib/shared/logger.js"),
    log = logger.get("core"),
    collectServices = require("../../../lib/core/collectServices.js"),
    collectModels = require("../../../lib/core/collectModels.js"),
    collectMiddleware = require("../../../lib/server/collectMiddleware.js"),
    browserifyModules = require("../../../lib/core/browserifyModules.js"),
    services = require("../../../lib/shared/services.js"),
    models = require("../../../lib/shared/models.js"),
    middleware = require("../../../lib/server/request/middleware.js"),
    startServer = require("../../../lib/server/startServer.js");

function populateServices(callback) {
    collectServices(config.paths.services, function onCollectServicesCallback(err, collectedServices) {

        console.log("FOUND SERVICES", collectedServices.server);

        services.setServices(collectedServices.server);
        callback(err, collectedServices.server);
    });
}

function populateModels(callback) {
    collectModels(config.paths.models, function onCollectModelsCallback(err, collectedModels) {
        models.setModels(collectedModels);
        callback(err, collectedModels);
    });
}

function populateMiddleware(callback) {
    async.parallel([
        function(cb){
            collectMiddleware(config.paths.services + "/servicesMiddleware.js", function(err, servicesMiddleware) {
                middleware.setMiddleware("services", servicesMiddleware);

                if(err) {
                    log.error(err);
                    log.debug("No services-middleware found. ");
                }
                cb();
            });

        },
        function(cb){
            collectMiddleware(config.paths.validators + "/validatorsMiddleware.js", function(err, validatorsMiddleware) {
                middleware.setMiddleware("validators",validatorsMiddleware);

                if(err) {
                    log.error(err);
                    log.debug("No validators-middleware found. ");
                }
                cb();
            });
        }
    ], callback);
}

function bootstrap() {

    log.info("Bootstrap: START");

    //check services
    log.info("Loading Services...");
    populateServices(function(err) {

        if(err) {
            log.error("Error loading Services: ", err);
            return;
        }
        log.info("Services ready.");
    });

    log.info("Loading Models...");
    populateModels(function(err) {

        if(err) {
            log.error("Error loading Models: ", err);
            return;
        }
        log.info("Models ready.");
    });

    //check middleware
    log.info("Loading Middleware...");
    populateMiddleware(function() {
        //error logging within populateMiddleware
        log.info("Middleware ready.");
    });
}

module.exports = bootstrap;