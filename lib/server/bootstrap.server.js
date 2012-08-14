"use strict"; // run code in ES5 strict mode

var async = require("async"),
    _ = require("underscore"),
    fs = require("fs"),
    path = require("path"),
    inspect = require("util").inspect;

var config = require("../shared/config.js"),
    logger = require("../shared/logger.js"),
    log = logger.get("core"),
    collectServices = require("./../core/collect/collectServices.js"),
    collectModels = require("./../core/collect/collectModels.js"),
    collectSchemas = require("./../core/collect/collectSchemas.js"),
    collectMiddleware = require("./collectMiddleware.js"),
    serviceRegistry = require("../shared/registries/serviceRegistry.js"),
    modelRegistry = require("../shared/registries/modelRegistry.js"),
    schemaRegistry = require("../shared/registries/schemaRegistry.js"),
    extendSchemas = require("../core/helpers/extendSchemas.js").extendSchemas,
    doRequire = require("../core/helpers/doRequire.js"),
    middleware = require("./request/middleware.js"),
    startServer = require("./startServer.js");

function populateServiceRegistry() {
    var collectedServices = collectServices(config.paths.services);

    collectedServices.server = doRequire(collectedServices.server);

    serviceRegistry.setServices(collectedServices);
    return collectedServices.server;
}

function populateModelRegistry() {
    var collectedModels = collectModels(config.paths.models);

    collectedModels.server = doRequire(collectedModels.server);
    collectedModels.shared = doRequire(collectedModels.shared);

    modelRegistry.setModels(collectedModels);
    return collectedModels;
}

function populateSchemasRegistry() {
    var collectedSchemas = collectSchemas(config.paths.schemas);

    collectedSchemas.server = doRequire(collectedSchemas.server);
    collectedSchemas.shared = doRequire(collectedSchemas.shared);

    //extend model schemas with shared schemas
    extendSchemas(collectedSchemas);
    schemaRegistry.setSchemas(collectedSchemas);
    return collectedSchemas;
}


function populateMiddleware(servicesRoutes, validatorsRoutes) {

    try {
        var servicesMiddleware = collectMiddleware(servicesRoutes, config.paths.services + "/servicesMiddleware.js");
        middleware.setMiddleware("services", servicesMiddleware);
    }
    catch(err) {
        log.debug("No service-middleware found. ");
    }

    try {
        var validatorsMiddleware = collectMiddleware(validatorsRoutes, config.paths.validators + "/validatorsMiddleware.js");
        middleware.setMiddleware("validators", validatorsMiddleware);
    }
    catch(err) {
        log.debug("No validator-middleware found. ");
    }
}

function bootstrap() {

    var collectedServices = null;

    log.info("Bootstrap: START");
    log.info("Doing blazing fast magical awesome mighty SCHMARRN.");

    //check services
    log.info("Loading Services...");
    collectedServices = populateServiceRegistry();
    log.info("Services ready.");

    //check services
    log.info("Loading Schemas...");
    populateSchemasRegistry();
    log.info("Schemas ready.");

    //check services
    log.info("Loading Models...");
    populateModelRegistry();
    log.info("Models ready.");

    //now load middleware
    log.info("Loading Middleware...");
    populateMiddleware(collectedServices, []);
    log.info("Middleware ready.");

    return startServer(config.port);
}

module.exports = bootstrap;
