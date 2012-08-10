"use strict"; // run code in ES5 strict mode

var async = require("async"),
    _ = require("underscore"),
    toSrc = require('toSrc'),
    fs = require("fs"),
    path = require("path"),
    inspect = require("util").inspect;

var config = require("./."),
    logger = require("../shared/logger.js"),
    log = logger.get("core"),
    collectServices = require("./../core/collect/collectServices.js"),
    collectModels = require("./../core/collect/collectModels.js"),
    collectSchemas = require("./../core/collect/collectSchemas.js"),
    collectMiddleware = require("collectMiddleware.js"),
    serviceRegistry = require("../shared/registries/serviceRegistry.js"),
    modelRegistry = require("../shared/registries/modelRegistry.js"),
    schemaRegistry = require("../shared/registries/schemaRegistry.js"),
    extendSchemas = require("../core/helpers/extendSchemas.js"),
    doRequire = require("../core/helpers/doRequire.js"),
    middleware = require("request/middleware.js"),
    startServer = require("startServer.js");


function populateServiceRegistry() {
    var collectedServices = collectServices(config.paths.services);

    collectedServices.server = doRequire(collectedServices.server);

    serviceRegistry.setServices(collectedServices);
}

function populateModelRegistry() {
    var collectedModels = collectModels(config.paths.models);

    collectedModels.server = doRequire(collectedModels.server);
    collectedModels.shared = doRequire(collectedModels.shared);

    modelRegistry.setModels(collectedModels);
}

function populateSchemas() {
    var collectedSchemas = collectSchemas(config.paths.schemas);

    collectedSchemas.server = doRequire(collectedSchemas.server);
    collectedSchemas.shared = doRequire(collectedSchemas.shared);

    //extend model schemas with shared schemas
    extendSchemas(collectedSchemas);
    schemaRegistry.setSchemas(collectedSchemas);
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