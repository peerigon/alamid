"use strict";

var log = require("../../shared/logger.js").get("core"),
    env = require("../../shared/env.js"),
    populateServiceRegistry = require("../../core/bundle/loaders/serviceRegistry.loader.js!./populateServiceRegistry.js"),
    populateModelRegistry = require("../../core/bundle/loaders/modelRegistry.loader.js!./populateModelRegistry.js"),
    populateSchemaRegistry = require("../../core/bundle/loaders/schemaRegistry.loader.js!./populateSchemaRegistry.js"),
    populatePageRegistry = require("../../core/bundle/loaders/pageRegistry.loader.js!./populatePageRegistry.js");

function bootstrap() {
    var collectedServices,
        collectedSchemas,
        collectedModels,
        collectedPages;

    log.info("Bootstrapping alamid now...");

    if (typeof populateServiceRegistry !== "function") {
        log.info("Could not populate registries: The webpack options don't have a 'alamidConfig'-property");
        return;
    }

    log.info("Feeding the 'Asian palm civet' " + String.fromCharCode(0xD83D, 0xDE38));
    collectedServices = populateServiceRegistry();
    collectedSchemas = populateSchemaRegistry();
    collectedModels = populateModelRegistry();
    collectedPages = populatePageRegistry();

    if (env.isDevelopment()) {
        log.debug("Collected Services: ", (Object.keys(collectedServices)).join(", "));
        log.debug("Collected Shared-Schemas: ", (Object.keys(collectedSchemas.shared)).join(", "));
        log.debug("Collected Client-Schemas: ", (Object.keys(collectedSchemas.client)).join(", "));
        log.debug("Collected Models: ", (Object.keys(collectedModels)).join(", "));
        log.debug("Collected Pages: ", (Object.keys(collectedPages)).join(", "));
    }
}

module.exports = bootstrap;