"use strict";

var _ = require("underscore"),
    value = require("value"),
    config = require("../shared/config"),
    log = require("../shared/logger.js").get("presentation"),
    env = require("../shared/env.js"),
    EventEmitter = require("../shared/EventEmitter.class.js"),
    Page = require("./Page.class.js"),
    MainPage = require("./MainPage.class.js"),
    pageJS = require("page"),
    subscribeModelHandler = require("./helpers/subscribeModelHandler.js"),
    bootstrapClient = require("./bootstrap.client.js");

var slice = Array.prototype.slice;

/**
 * @class Client
 * @extends EventEmitter
 */
var Client = EventEmitter.extend("Client", {

    /**
     * @type {Socket}
     */
    socket: null,

    /**
     * @type {MainPage}
     */
    mainPage: null,

    /**
     * @type {Function}
     */
    MainPage: MainPage,

    /**
     * @private
     * @type {Boolean}
     */
    _isRunning: false,

    /**
     * @private
     * @type {Boolean}
     */
    _bootstrapped: false,

    /**
     * @constructor
     */
    constructor: function () {
        Client.instance = this;
        if (env.isDevelopment()) {
            pageJS(debugDispatchRoute);
        }
    },

    /**
     * enable automatic model-subscription
     */
    enableModelSubscribe : function () {
        subscribeModelHandler(this.socket);

        return this;
    },

    bootstrap: function () {
        bootstrapClient();
        this._bootstrapped = true;

        return this;
    },

    /**
     * Registers a handler for a specific route. The route maybe a string with special parts for capturing or a
     * regular expression. For instance:
     *
     * - "/home/about"
     * - "/blog/:author/posts/:postId?"      captures the string at :author and optionally :postId
     * - "/blog/\*" (without backslash)      matches all sub routes of /blog
     *
     * The handler may be a function or a string.
     *
     * A handler-function will be called with a context object and a next-function. For a complete reference of the
     * context-object @see http://visionmedia.github.com/page.js/
     * Calling next() will delegate control to the next matching route handler.
     *
     * If the handler is a string it will be interpreted as pageURL calling app.changePage() with that given pageURL.
     *
     * @param {String|RegExp} route
     * @param {String|Function} handler
     * @return {Client}
     */
    addRoute: function (route, handler) {
        var pageJSArguments,
            handlers;

        switch (arguments.length) {
            case 1: handlers = [route]; break;
            case 2: handlers = [handler]; break;
            case 3: handlers = [handler, arguments[2]]; break;
            case 4: handlers = [handler, arguments[2], arguments[3]]; break;
            default: handlers = slice.call(arguments, 1);
        }

        handlers = _(handlers).map(prepareRouteHandler, this);

        pageJSArguments = handlers;
        pageJSArguments.unshift(route);
        pageJS.apply(pageJS, pageJSArguments);

        return this;
    },

    changePage: function () {
        this.mainPage.changePage.apply(this.mainPage, arguments);
    },

    /**
     * Set custom instances and enable/disable functions
     *
     * @param {String} what
     * @param {*} how
     * @return {Client}
     */
    use: function (what, how) {

        switch (what) {
            case "websockets" :
                config.use.websockets = true;

                //how might be a socket instance
                if (value(how).typeOf(Object)) {
                    this.socket = how;
                }
                break;
            case "http" :
                //maybe we'll add an options
                //for a http-request handler
                config.use.http = true;
                break;
            case "casting" :
                config.use.casting = true;
                break;
            case "services" :
                config.use.services = true;
                break;
            case "validators" :
                config.use.validators = true;
                break;
        }

        return this;
    },

    /**
     * Initializes the main page, registers event listeners for route changes and
     * dispatches the first route according to window.location
     *
     * @param {Object=} pageJSOptions @see http://visionmedia.github.com/page.js/
     */
    start: function (pageJSOptions) {
        var initialContext = new pageJS.Context(location.pathname, pageJS.base()),
            MainPageClass = this.MainPage,
            mainPage;

        if (this._bootstrapped === false) {
            this.bootstrap();
        }

        if (config.use !== undefined && config.use.websockets && this.socket === null) {
            initDefaultSocket(this);
        }

        mainPage = new MainPageClass(initialContext, document);
        if (value(mainPage).notTypeOf(MainPage)) {
            throw new TypeError("(alamid) Cannot start client: The main page must be a child of MainPage, instead saw '" + typeof mainPage + "'");
        }
        this.mainPage = mainPage;

        addDefaultRouteHandler(this);

        pageJS.start(pageJSOptions);
        this._isRunning = true;

        return this;
    },

    /**
     * Dispatches the given route and gives control to the route handlers that match to the given route.
     *
     * @param {!String} route
     * @return {Client}
     */
    dispatchRoute: function (route) {
        if (this._isRunning === false) {
            this.start({
                dispatch: false
            });
        }

        pageJS(route);

        return this;
    }
});

/**
 * @type {Client}
 */
Client.instance = null;

function prepareRouteHandler(handler) {
    var pageUrl,
        self = this;

    if (value(handler).typeOf(String)) {
        pageUrl = handler;
        handler = function handleRoute(ctx) {
            self.changePage(pageUrl, ctx);
        };
    } else if (value(handler).notTypeOf(Function)) {
        throw new TypeError("(alamid) Cannot register route: The handler must be a string or a function. " +
            "Instead saw typeof '" + typeof handler + "'");
    }

    return handler;
}

function initDefaultSocket(self) {
    if (typeof io === "undefined") {
        throw new ReferenceError("(alamid) window.io is not defined: Add socket io to your scripts or " +
            "disable Websockets in your alamid config");
    }
    self.socket = io.connect();
}

function debugDispatchRoute(ctx, next) {
    log.debug("dispatching: " + ctx.path, ctx);
    next();
}

function addDefaultRouteHandler(self) {
    pageJS("*", function (ctx) {
        self.changePage(ctx.path, ctx);
    });
}

module.exports = Client;