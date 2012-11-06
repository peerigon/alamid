"use strict";

var Class = require("nodeclass").Class,
    EventEmitter = require("../shared/EventEmitter.class.js");

// Server Bootstrap
var bootstrapServer = require("./bootstrap.server.js"),
    startServer = require("./startServer.js"),
    config = require("../shared/config.js"),
    setSocketIOOptions = require("./transport/websocket/websocket.js").setSocketIOOptions,
    setConnectInstance = require("./transport/http/http.js").setConnectInstance;

var Server = new Class("Server", {

    Extends : EventEmitter,

    __stack : null,
    __bootstrapped : false,

    init : function(connectInstance) {

        //set custom connect instance
        if(connectInstance) {
            setConnectInstance(connectInstance);
        }

        //init stack
        this.__stack = {
            create : [],
            read : [],
            update : [],
            destroy : []
        };
    },
    //addRoute("get", "/services/bla", handler1, handler2
    //addRoute("*", "/services/bla", handler1, handler2
    //Not working
    addRoute : function(method, route, fn) {

        // default route to '/'
        if (typeof route !==  'string' ) {
            fn = route;
            route = '/';
        }

        this.__stack[method].push({ route: route, handle: fn });

        return this;
    },
    getStack : function() {
        return this.__stack;
    },
    bootstrap : function() {
        this.__bootstrapped = true;
        return bootstrapServer();
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
    }
});

module.exports = Server;