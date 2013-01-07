"use strict";

var EventEmitter = require("../shared/EventEmitter.class.js");

// Server Bootstrap
var bootstrapServer = require("./bootstrap.server.js"),
    sanitizeConfig = require("../core/config/sanitizeConfig.js"),
    startServer = require("./startServer.js"),
    config = require("../shared/config.js"),
    session = require("./session.js"),
    router = require("./router.js"),
    httpCrud = require("../shared/helpers/httpCrud.js"),
    setSocketIOOptions = require("./transport/websocket/websocket.js").setSocketIOOptions,
    setConnectInstance = require("./transport/http/http.js").setConnectInstance,
    setSPDYOptions = require("./transport/spdy/spdy.js").setOptions,
    attachAlamidMiddleware = require("./attachAlamidMiddleware.js");

/**
 * The Server-Class
 * @type {Class}
 */
var Server = EventEmitter.extend("Server", {

    __bootstrapped : false,
    __router : null,
    middlewareAttached : false,

    constructor : function(connectInstance) {

        //set custom connect instance
        if(connectInstance) {
            setConnectInstance(connectInstance);
        }

        router.init();

        this.__router = router.get();
    },
    addRoute : function(methods, route, fns) {

        var self = this;

        //workaround until middler is working again
        if(Array.isArray(methods) || Array.isArray(fns)) {

            if(!Array.isArray(methods)) {
                methods = [methods];
            }

            if(!Array.isArray(fns)) {
                fns = [fns];
            }

            methods.forEach(function(method) {

                fns.forEach(function(fn) {
                    self.addRoute(method, route, fn);
                });
            });

            return;
        }

        methods = httpCrud.convertCRUDtoHTTP(methods);
        this.__router[methods](route, fns);
    },
    getRouter : function() {
        return this.__router;
    },
    bootstrap : function() {
        this.__bootstrapped = true;
        this.attachAlamidMiddleware();
        return bootstrapServer();
    },
    attachAlamidMiddleware : function() {

        if(!this.middlewareAttached) {
            attachAlamidMiddleware(this);
            this.middlewareAttached = true;
        }

    },
    start : function(port) {

        //only bootstrap if it hadn't been called
        if(!this.__bootstrapped) {
            this.bootstrap();
        }

        return this.server = startServer(port);
    },
    setSocketIOOptions : function(options) {
        setSocketIOOptions(options);
    },
    setSPDYOptions : function(options) {
        setSPDYOptions(options);
    },
    setConfig : function(key, value) {
        config[key] = value;
        //re-sanitize config
        //also need to set current paths
        config = sanitizeConfig(config);
    },
    getConfig : function() {
        return config;
    },
    setSession : function(sessionObject) {
        session.set(sessionObject);
    },
    close : function() {
        router.reset();
        this.server.close();
    }
});

module.exports = Server;