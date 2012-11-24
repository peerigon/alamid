"use strict";

var Class = require("nodeclass").Class,
    EventEmitter = require("../shared/EventEmitter.class.js");

// Server Bootstrap
var bootstrapServer = require("./bootstrap.server.js"),
    startServer = require("./startServer.js"),
    config = require("../shared/config.js"),
    session = require("./session.js"),
    router = require("./router.js"),
    httpCrud = require("../shared/helpers/httpCrud.js"),
    setSocketIOOptions = require("./transport/websocket/websocket.js").setSocketIOOptions,
    setConnectInstance = require("./transport/http/http.js").setConnectInstance,
    attachAlamidMiddleware = require("./attachAlamidMiddleware.js");

var Server = new Class("Server", {

    Extends : EventEmitter,

    __bootstrapped : false,
    __router : null,
    middlewareAttached : false,

    init : function(connectInstance) {

        //set custom connect instance
        if(connectInstance) {
            setConnectInstance(connectInstance);
        }

        router.init();

        this.__router = router.get();
    },
    //addRoute("get", "/services/bla", handler1, handler2
    //addRoute("*", "/services/bla", handler1, handler2
    addRoute : function(methods, route, fn) {

        var self = this;

        if(Array.isArray(methods)) {

            methods.forEach(function(method) {
                self.addRoute(method, route, fn);
            });

            return;
        }

        methods = httpCrud.convertCRUDtoHTTP(methods);

        //console.log("adding route check: ", methods, route,  fn);

        this.__router.add(methods, route, fn);
    },
    getRouter : function() {
        return this.__router;
    },
    getStack : function() {
        return this.__stack;
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
    setConfig : function(key, value) {
        config[key] = value;
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