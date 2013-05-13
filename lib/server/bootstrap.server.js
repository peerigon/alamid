"use strict"; // run code in ES5 strict mode

var _ = require("underscore"),
    fs = require("fs"),
    path = require("path"),
    config = require("../shared/config.js"),
    log = require("../shared/logger.js").get("core");

var collectServices,
    collectModels,
    collectSchemas,
    serviceRegistry,
    modelRegistry,
    schemaRegistry,
    extendSchemas,
    doRequire,
    instantiateClasses,
    connect,
    session,
    http,
    websocket,
    handleHttp,
    attachAlamidMiddleware;

function requireDependencies() {
    // Lazy require
    collectServices = require("./../core/collect/collectServices.js");
    collectModels = require("./../core/collect/collectModels.js");
    collectSchemas = require("./../core/collect/collectSchemas.js");
    serviceRegistry = require("../shared/registries/serviceRegistry.js");
    modelRegistry = require("../shared/registries/modelRegistry.js");
    schemaRegistry = require("../shared/registries/schemaRegistry.js");
    extendSchemas = require("../core/helpers/extendSchemas.js").extendSchemas;
    doRequire = require("../core/helpers/doRequire.js");
    instantiateClasses = require("../core/helpers/instantiateClasses.js");
    connect = require("connect");
    session = require("./session.js");
    http = require("./transport/http/http.js");
    websocket = require("./transport/websocket/websocket.js");
    handleHttp = require("./transport/http/handleHttp.js");
    attachAlamidMiddleware = require("./request/attachAlamidMiddleware.js");    
}

function bootstrap() {
    log.info("Bootstrapping alamid now...");
    log.info("Feeding the 'Asian palm civet' " + String.fromCharCode(0xD83D, 0xDE38));
    
    requireDependencies();
    populateRegistries();
    prepareServer();
}

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

function populateRegistries() {
    var collectedServices,
        collectedSchemas,
        collectedModels;

    //check services
    collectedServices = populateServiceRegistry();

    log.debug("Loaded Services: ", (Object.keys(collectedServices)).join(", "));

    //check schemas
    collectedSchemas = populateSchemasRegistry();
    log.debug("Loaded Shared-Schemas: ", (Object.keys(collectedSchemas.shared)).join(", "));
    log.debug("Loaded Server-Schemas: ", (Object.keys(collectedSchemas.server)).join(", "));

    //check models
    collectedModels = populateModelRegistry();
    log.debug("Loaded Models: ", (Object.keys(collectedModels)).join(", "));
}

function prepareServer() {

    var app = http.initConnect(),
        whichHttpRoutes = {
            dynamic : false,
            static : false
        },
        whichAlamidRoutes = {
            services : config.use.services,
            validators : config.use.validators
        },
        sess;

    //session support
    if (config.use.session === true) {
        log.info("Session: active");

        sess = session.get();

        app.use(connect.cookieParser(sess.secret));
        app.use(connect.session(sess));
    }

    //registering alamid-routes
    if (config.use.http === true) {
        log.info("HTTP-Routes: active");
        whichHttpRoutes.dynamic = true;
    }

    //registering alamid-routes
    if (config.use.staticFileServer === true) {
        log.info("Static-File-Server: active");
        whichHttpRoutes.static = true;
    }

    //http routes
    handleHttp.initRoutes(app, whichHttpRoutes);

    //websockets are attached on server start
    //that's the way socket.io is handling this

    //alamid transport independent routes
    attachAlamidMiddleware(whichAlamidRoutes);

    return app;
}

module.exports = bootstrap;