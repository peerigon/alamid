"use strict";

/** @typedef {{preventDefault: Function, toPageURL: String, pageParams: Object}} */
var PageChangeEvent,
    /** @typedef {} */
        Socket;

var _ = require("underscore"),
    value = require("value"),
    config = require("../shared/config"),
    log = require("../shared/logger.js").get("presentation"),
    env = require("../shared/env.js"),
    EventEmitter = require("../shared/EventEmitter.class.js"),
    Page = require("./Page.class.js"),
    PageLoader = require("./PageLoader.class.js"),
    pageJS = require("page"),
    resolvePageUrls = require("../shared/helpers/resolvePageUrls.js"),
    pathHelpers = require("../shared/helpers/pathHelpers.js"),
    pageRegistry = require("./registries/pageRegistry.js"),
    default404Template = require("./defaults/404.html"),
    subscribeModelHandler = require("./helpers/subscribeModelHandler.js");

var slice = Array.prototype.slice;

/**
 * @class Client
 * @extends EventEmitter
 */
var Client = EventEmitter.extend("Client", {

    /**
     * @event
     * @name App#beforePageChange
     * @param {PageChangeEvent} pageChangeEvent
     */

    /**
     * @event
     * @name App#pageChange
     */

    /**
     * @type {Socket}
     */
    socket: null,

    /**
     * @private
     * @type {Page}
     */
    _mainPage: null,

    /**
     * @private
     * @type {Function}
     */
    _mainPageClass: null,

    /**
     * @private
     * @type {PageLoader}
     */
    _activePageLoader: null,

    /**
     * @private
     * @type {Boolean}
     */
    _isRunning: false,

    /**
     * @param {!Function} MainPageClass
     * @constructor
     */
    constructor: function (MainPageClass) {
        if (value(MainPageClass).notTypeOf(Function)) {
            throw new TypeError("(alamid) Cannot init App: The MainPageClass must be a function.");
        }

        if (env.isDevelopment()) {
            pageJS(function debugDispatchRoute(ctx, next) {
                log.debug("dispatching: " + ctx.path, ctx);
                next();
            });
        }

        this._mainPageClass = MainPageClass;
    },
    /**
     * return the socket.io instance
     *
     * @return {*}
     */
    getSocket : function () {
        return this.socket;
    },

    /**
     * enable automatic model-subscription
     */
    enableModelSubscribe : function () {
        subscribeModelHandler(this.socket);
    },

    /**
     * Returns the main page.
     *
     * @return {Page}
     */
    getMainPage: function () {
        return this._mainPage;
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

        handlers = _(handlers).map(this._prepareRouteHandler, this);

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
     * @param {!String|Function} handler
     * @private
     */
    _prepareRouteHandler: function (handler) {
        var pageURL,
            self = this;

        if (value(handler).typeOf(String)) {
            pageURL = handler;
            handler = function handleRoute(ctx) {
                self.changePage(pageURL, ctx);
            };
        } else if (value(handler).notTypeOf(Function)) {
            throw new TypeError("(alamid) Cannot register route: The handler must be a string or a function. " +
                "Instead saw typeof '" + typeof handler + "'");
        }

        return handler;

    },

    /**
     * Initializes the main page, registers event listeners for route changes and
     * dispatches the first route according to window.location
     *
     * @param {Object=} pageJSOptions @see http://visionmedia.github.com/page.js/
     */
    start: function (pageJSOptions) {
        var MainPageClass = this._mainPageClass,
            mainPageParentNode = document.body,
            initialContext = new pageJS.Context(location.pathname, pageJS.base()),
            self = this,
            mainPage;

        if (!mainPageParentNode) {
            throw new Error(
                '(alamid) Cannot start app: Could not find an element with data-node="page" under document.body'
            );
        }

        if (config.use !== undefined && config.use.websockets && this.socket === null) {
            this._initDefaultSocket();
        }

        mainPage = new MainPageClass(initialContext);
        mainPageParentNode.appendChild(mainPage._root);
        this._mainPage = mainPage;

        // If App is in development mode add as last route alamid's default 404 Route.
        if (env.isDevelopment()) {
            pageJS("*", function display404Page() {
                var default404Page = new Page({}, default404Template);

                self._mainPage.setSubPage(default404Page);
            });
        }

        this._addOnUnloadListener();
        this._isRunning = true;

        pageJS.start(pageJSOptions);
    },

    /**
     * Dispatches the given route and gives control to the route handlers that match to the given route.
     *
     * @param {!String} route
     * @return {Client}
     */
    dispatchRoute: function (route) {
        if (this._isRunning === false) {
            this.start({dispatch: false});
        }

        pageJS(route);

        return this;
    },

    /**
     * Emits 'beforeLeave' with the possibility to abort the operation via preventDefault().
     * The events will be emitted on every page in the array from right to left (bottom -> top).
     *
     * @param {Array.<Page>} pages
     * @param {String} pageURL
     * @param {Object} params
     * @return {Boolean} true if preventDefault() has been called
     * @private
     */
    _emitLeaveEventOnPages: function (pages, pageURL, params) {
        var preventDefault = false,
            page,
            i,
            event = {
                toPageURL: pageURL,
                pageParams: params,
                preventDefault: function () {
                    preventDefault = true;
                }
            };

        for (i = pages.length - 1; i >= 0; i--) {
            page = pages[i];
            page.emit("beforeLeave", event);
            if (preventDefault) {
                break;  // stop emitting the leave event, the current page takes the control flow
            }
        }

        return preventDefault;
    },

    /**
     * add a onload listener which emits the pageLeave event on all pages
     * @private
     */
    _addOnUnloadListener : function () {

        var self = this;

        window.onunload = function () {

            var currentPages = self.getCurrentPages();

            self._emitLeaveEventOnPages(currentPages, "unload", {});
        };
    },

    /**
     * Initializes socket.io
     *
     * @private
     */
    _initDefaultSocket : function () {

        if (typeof io === "undefined") {
            throw new ReferenceError("(alamid) window.io is not defined: Add socket io to your scripts or " +
                "disable Websockets in your alamid config");
        }
        this.socket = io.connect();

    }
});

module.exports = Client;