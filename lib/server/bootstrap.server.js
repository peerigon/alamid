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
    serviceRegistry = require("../shared/registries/serviceRegistry.js"),
    modelRegistry = require("../shared/registries/modelRegistry.js"),
    schemaRegistry = require("../shared/registries/schemaRegistry.js"),
    extendSchemas = require("../core/helpers/extendSchemas.js").extendSchemas,
    doRequire = require("../core/helpers/doRequire.js"),
    instantiateClasses = require("../core/helpers/instantiateClasses.js");

function populateServiceRegistry() {
    var collectedServices = collectServices(config.paths.services);

    collectedServices.server = doRequire(collectedServices.server);
    collectedServices.server = instantiateClasses(collectedServices.server);

    serviceRegistry.setServices(collectedServices.server);
    return collectedServices.server;
}

function populateModelRegistry() {
    var collectedModels = collectModels(config.paths.models);

    collectedModels = doRequire(collectedModels.server);
    //collectedModels = doRequire(collectedModels.shared);

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

function bootstrap() {

    log.info("Bootstrap: START");
    log.info("Doing blazing fast magical awesome mighty SCHMARRN.");

    //check services
    log.info("Loading Services...");
    var collectedServices = populateServiceRegistry();
    log.debug("Found services:",(Object.keys(collectedServices)).join(","));
    log.info("Services ready.");

    //check schemas
    log.info("Loading Schemas...");
    var collectedSchemas = populateSchemasRegistry();
    log.debug("Found shared-schemas: ",(Object.keys(collectedSchemas.shared)).join(","));
    log.debug("Found server-schemas: ",(Object.keys(collectedSchemas.server)).join(","));
    log.info("Schemas ready.");

    //check models
    log.info("Loading Models...");
    var collectedModels = populateModelRegistry();
    log.debug("Found models: ",(Object.keys(collectedModels)).join(","));
    log.info("Models ready.");
}

module.exports = bootstrap;
