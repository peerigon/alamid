"use strict";

var value = require("value"),
    config = require("../shared/config"),
    log = require("../shared/logger.js").get("presentation"),
    env = require("../shared/env.js"),
    Base = require("../shared/Base.class.js"),
    Page = require("./Page.class.js"),
    PageController = require("./PageController.class.js"),
    request = require("./helpers/request.js"),
    pageJS = require("page"),
    bootstrap = require("./bootstrap"),
    subscribeModelHandler = require("./helpers/subscribeModelHandler.js");

var slice = Array.prototype.slice;

/**
 * @class Client
 * @extends Base
 */
var Client = Base.extend("Client", {

    /**
     * @type {Socket}
     */
    socket: null,

    /**
     * @type {Page}
     */
    mainPage: null,

    /**
     * @type {PageController}
     * @private
     */
    _pageController: null,

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

    bootstrap: function () {

        bootstrap();
        this._bootstrapped = true;

        return this;

    },

    /**
     * Enable automatic model-subscription
     * @returns {Client}
     */
    enableModelSubscribe : function () {
        subscribeModelHandler(this.socket);

        return this;
    },

    /**
     * Registers a handler for a specific route. The route maybe a string with special parts for capturing or a
     * regular expression. For instance:
     *
     * - "/home/about"
     * - "/blog/:author/posts/:postId?"      captures the string at :author and optionally :postId
     * - "/blog/*"      matches all sub routes of /blog
     *
     * The handler may be a function or a string.
     *
     * A handler-function will be called with a context object and a next-function. For a complete reference of the
     * context-object @see http://visionmedia.github.com/page.js/
     * Calling next() will delegate control to the next matching route handler.
     *
     * If the handler is a string it will be interpreted as pageUrl calling client.show() with that given pageURL.
     *
     * @param {String|RegExp} route
     * @param {String|Function} handler
     * @returns {Client}
     */
    addRoute: function (route, handler) {
        var self = this,
            pageJSArguments,
            handlers;

        switch (arguments.length) {
            case 1: handlers = [route]; break;
            case 2: handlers = [handler]; break;
            case 3: handlers = [handler, arguments[2]]; break;
            case 4: handlers = [handler, arguments[2], arguments[3]]; break;
            default: handlers = slice.call(arguments, 1);
        }

        handlers = handlers.map(function prepareRouteHandler(handler) {
            var pageUrl;

            if (value(handler).typeOf(String)) {
                pageUrl = handler;
                handler = function handleRoute(ctx) {
                    self.show(pageUrl, ctx);
                };
            } else if (value(handler).notTypeOf(Function)) {
                throw new TypeError("(alamid) Cannot register route: The handler must be a string or a function. " +
                    "Instead saw typeof '" + typeof handler + "'");
            }

            return handler;
        });

        pageJSArguments = handlers;
        pageJSArguments.unshift(route);
        pageJS.apply(pageJS, pageJSArguments);

        return this;
    },

    /**
     * Set custom instances and enable/disable functions
     *
     * @param {String} what
     * @param {*} how
     * @returns {Client}
     */
    use: function (what, how) {

        config.use = config.use || {};

        if(how === false) {
            config.use[what] = false;
            return this;
        }

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
     * @returns {Client}
     */
    start: function (pageJSOptions) {
        var mainPage = this.mainPage,
            pageController,
            initialContext;

        if (!this._bootstrapped) {
            this.bootstrap();
        }

        if(!this.socket && config.use && config.use.websockets) {
            throw new Error("Please provide a socket.io instance or disable websockets");
        }

        request.socket = this.socket;

        if (!mainPage) {
            initialContext = new pageJS.Context(location.pathname, pageJS.base());
            this.mainPage = mainPage = new Page(initialContext, document);
            if (!mainPage._nodes.page) {
                mainPage._nodes.page = document.body;
            }
        }
        this._pageController = pageController = new PageController(mainPage);
        proxyEvent(pageController, this, "beforePageChange");
        proxyEvent(pageController, this, "pageChange");

        addDefaultRouteHandler(this);

        this._isRunning = true;
        pageJS.start(pageJSOptions);

        return this;
    },

    /**
     * Dispatches the given route and gives control to the route handlers that match to the given route.
     *
     * @param {!String} route
     * @returns {Client}
     */
    dispatchRoute: function (route) {
        if (this._isRunning === false) {
            throw new Error("Cannot dispatchRoute: The client has not been started yet. Call client.start() before.");
        }

        pageJS(route);

        return this;
    },

    /**
     * @see PageController#show()
     * @returns {Client}
     */
    show: function (pageUrl, context) {
        this._pageController.show.apply(this._pageController, arguments);

        return this;
    },

    /**
     * @see PageController#getCurrentPages()
     * @returns {Array}
     */
    getCurrentPages: function () {
        return this._pageController.getCurrentPages.apply(this._pageController, arguments);
    },

    /**
     * Returns true if client.start() has already been called.
     *
     * @returns {Boolean}
     */
    isRunning: function () {
        return this._isRunning;
    }
});

/**
 * @type {Client}
 */
Client.instance = null;

function debugDispatchRoute(ctx, next) {
    log.debug("dispatching: " + ctx.path, ctx);
    next();
}

function addDefaultRouteHandler(self) {
    pageJS("*", function (ctx) {
        self.show(ctx.pathname, ctx);
    });
}

function proxyEvent(from, to, eventName) {
    from.on(eventName, function proxyEvent(event) {
        to.emit(eventName, event);
    });
}

module.exports = Client;