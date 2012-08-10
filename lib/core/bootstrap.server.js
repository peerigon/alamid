"use strict"; // run code in ES5 strict mode

var async = require("async"),
    _ = require("underscore"),
    toSrc = require('toSrc'),
    fs = require("fs"),
    path = require("path"),
    inspect = require("util").inspect;

var config = require("./config"),
    logger = require("../shared/logger.js"),
    log = logger.get("core"),
    collectServices = require("./collectServices.js"),
    collectModels = require("./collectModels.js"),
    collectSchemas = require("./collectSchemas.js"),
    collectMiddleware = require("../server/collectMiddleware.js"),
    browserifyModules = require("./browserifyModules.js"),
    services = require("../shared/registries/serviceRegistry.js"),
    models = require("../shared/registries/modelRegistry.js"),
    schemas = require("../shared/registries/schemaRegistry.js"),
    middleware = require("../server/request/middleware.js"),
    startServer = require("../server/startServer.js");

function populateServerServices(callback) {
    collectServices(config.paths.services, function onCollectServicesCallback(err, collectedServices) {
        //we only store server-services here
        services.setServices(collectedServices.server);
        callback(err, collectedServices.server);
    });
}

function populateModels(callback) {
    collectModels(config.paths.models, function onCollectModelsCallback(err, collectedModels) {
        //we store all models, because we need server & shared models!
        models.setModels(collectedModels);
        callback(err, collectedModels);
    });
}

function populateSchemas(callback) {
    collectSchemas(config.paths.models, function onCollectModelsCallback(err, collectedSchemas) {
        //we store all models, because we need server & shared models!
        schemas.setSchemas(collectedSchemas);
        callback(err, collectedSchemas);
    });
}



function populateMiddleware(servicesRoutes, validatorsRoutes, callback) {
    async.parallel([
        function(cb){
            collectMiddleware(servicesRoutes, config.paths.services + "/servicesMiddleware.js", function(err, servicesMiddleware) {
                middleware.setMiddleware("services", servicesMiddleware);

                if(err) {
                    log.debug("No service-middleware found. ");
                }
                cb();
            });

        },
        function(cb){
            collectMiddleware(validatorsRoutes, config.paths.validators + "/validatorsMiddleware.js", function(err, validatorsMiddleware) {
                middleware.setMiddleware("validators",validatorsMiddleware);

                if(err) {
                    log.debug("No validator-middleware found. ");
                }
                cb();
            });
        }
    ], callback);
}

function bootstrap() {

    log.info("Bootstrap: START");
    log.info("Doing blazing fast magical awesome mighty SCHMARRN.");

    //check services
    log.info("Loading Services...");
    populateServerServices(function(err, collectedServices) {
        if(err) {
            log.error("Error loading Services: ", err.message);
            return;
        }
        log.info("Services ready.");

        //now load middleware
        log.info("Loading Middleware...");
        populateMiddleware(collectedServices, [], function(err) {
            if(err) {
                log.error("Error loading middleware: ", err.message);
                return;
            }
            log.info("Middlware ready.");
        });
    });

    log.info("Loading Schemas...");
    populateSchemas(function(err) {

        if(err) {
            log.error("Error loading Schemas: ", err);
            return;
        }
        log.info("Schemas ready.");
    });

    log.info("Loading Models...");
    populateModels(function(err) {

        if(err) {
            log.error("Error loading Models: ", err);
            return;
        }
        log.info("Models ready.");
    });


    //write init.html
    //write init.js (alamidClientBundle, bootstrap.client)

    //start server
    startServer(config.port);
}

//module.exports = bootstrap;

exports.generateClientConfig = generateClientConfig;
exports.renderBootstrapClientTemplate = renderBootstrapClientTemplate;