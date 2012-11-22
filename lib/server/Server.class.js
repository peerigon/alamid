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

        if(!Array.isArray(methods)) {
            methods = [methods];
        }

        //convert CRUD to HTTP
        methods.forEach(function(value, index) {
            methods[index] = httpCrud.convertCRUDtoHTTP(value);
        });

        console.log("adding route: ", methods, route,  fn);

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
      attachAlamidMiddleware(this);
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
        this.server.close();
    }
});

module.exports = Server;