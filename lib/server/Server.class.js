"use strict";

var Base = require("../shared/Base.class.js"),
    bootstrapServer = require("./bootstrap.server.js"),
    sanitizeConfig = require("../core/config/sanitizeConfig.js"),
    startServer = require("./startServer.js"),
    config = require("../shared/config.js"),
    session = require("./session.js"),
    router = require("./router.js"),
    setSocketIOOptions = require("./transport/websocket/websocket.js").setSocketIOOptions,
    setConnectInstance = require("./transport/http/http.js").setConnectInstance,
    setSPDYOptions = require("./transport/spdy/spdy.js").setOptions;

/**
 * The Server-Class
 * @type {Class}
 */
var Server = Base.extend("Server", {

    _bootstrapped : false,
    _router : null,

    constructor : function(connectInstance) {

        //set custom connect instance
        if(connectInstance) {
            setConnectInstance(connectInstance);
        }

        this._router = router.get("alamid");
    },
    addRoute : function(methods, route, fns) {
        this._router.addAlamidRoute(methods, route, fns);
    },
    bootstrap : function() {
        bootstrapServer();
        this._bootstrapped = true;
    },
    start : function(port) {

        //only bootstrap if it hadn't been called
        if(!this._bootstrapped) {
            this.bootstrap();
        }

        return this.server = startServer(port);
    },
    set : function(key, value) {
        config[key] = value;
        //re-sanitize config
        //also need to set current paths
        config = sanitizeConfig(config);
    },
    use : function(what, how) {

        if(how === false) {
            config.use[what] = false;
            return this;
        }

        switch (what) {
            case "session" :
                session.set(how);
                break;
            case "http" :
                config.use.http = true;
                setConnectInstance(how);
                break;
            case "websockets" :
                config.use.websockets = true;
                setSocketIOOptions(how);
                break;
            case "spdy" :
                config.use.spdy = true;
                setSPDYOptions(how);
                break;
            case "staticFileServer" :
                config.use.staticFileServer = true;
                break;
            case "services" :
                config.use.services = true;
                break;
            case "validators" :
                config.use.validators = true;
                break;
            default :
                throw new Error("(alamid) server.use '" + what + "' is not supported.");
        }

        return this;
    },
    close : function() {
        router.reset();
        this._bootstrapped = false;
        this.server.close();
    }
});

module.exports = Server;