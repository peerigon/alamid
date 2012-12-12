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

    log.info("Bootstrapping alamid now...");
    log.info("Feeding the 'Asian palm civet' " + String.fromCharCode(0xD83D, 0xDE38));

    //check services
    var collectedServices = populateServiceRegistry();
    log.debug("Loaded Services:", (Object.keys(collectedServices)).join(","));

    //check schemas
    var collectedSchemas = populateSchemasRegistry();
    log.debug("Loaded Shared-Schemas:", (Object.keys(collectedSchemas.shared)).join(","));
    log.debug("Loaded Server-Schemas:", (Object.keys(collectedSchemas.server)).join(","));

    //check models
    var collectedModels = populateModelRegistry();
    log.debug("Loaded Models:", (Object.keys(collectedModels)).join(","));
}

module.exports = bootstrap;
