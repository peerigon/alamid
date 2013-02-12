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
    resolvePageURLs = require("../shared/helpers/resolvePageURLs.js"),
    pageRegistry = require("./registries/pageRegistry.js"),
    Default404Page = require("./defaults/Default404Page.class.js"),
    subscribeModelHandler = require("./helpers/subscribeModelHandler.js");

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
     * @throws {TypeError}
     * @constructor
     */
    constructor: function (MainPageClass) {
        if (value(MainPageClass).notTypeOf(Function)) {
            throw new TypeError("(alamid) Cannot init App: The MainPageClass must be a function.");
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
     * Returns the current page hierarchy including the main page at index 0.
     *
     * @return {Array.<Page>}
     */
    getCurrentPages: function () {
        var page = this._mainPage,
            currentPages = [page];

        while ((page = page.getSubPage())) {
            currentPages.push(page);
        }

        return currentPages;
    },

    /**
     * @return {Page|null}
     */
    getParentPage: function () {
        var currentPages = this.getCurrentPages();

        return currentPages[currentPages.length - 2] || null;
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
     * @param {!String|RegExp} route
     * @param {!String|Function} handler
     * @throws {TypeError}
     * @return {Client} the instance
     */
    addRoute: function (route, handler) {

        var pageJSArguments,
            handlers = [],
            argumentsCount = arguments.length,
            isDev = env.isDevelopment(),
            self = this;

        if (argumentsCount === 2) {
            handlers.push(handler);
        }

        if (argumentsCount > 2) {
            handlers = Array.prototype.slice.call(arguments, 1);
        }

        _(handlers).each(function prepareHandler(handlerToPrepare, index) {

            var preparedHandlerReference,
                preparedHandler = self._prepareRouteHandler(handlerToPrepare);

            if (isDev) {
                preparedHandlerReference = preparedHandler;
                preparedHandler = function debugDispatchRoute(ctx, next) {
                    log.debug("dispatching: " + route, ctx);
                    preparedHandlerReference(ctx, next);
                };
            }

            handlers[index] = preparedHandler;
        });

        handlers.unshift(route);
        pageJSArguments = handlers;

        pageJS.apply(null, pageJSArguments);

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
            mainPage,
            mainPageParentNode = document.body,
            default404Page,
            self = this;

        if (!mainPageParentNode) {
            throw new Error(
                '(alamid) Cannot start app: Could not find an element with data-node="page" under document.body'
            );
        }

        if (config.use !== undefined && config.use.websockets && this.socket === null) {
            this._initSocket();
        }

        // Passing an empty object as params to keep the Page.constructor()-signature consistent.
        // Because the MainPage is the very first page, there are no params.
        mainPage = new MainPageClass(this.getContext());
        mainPageParentNode.appendChild(mainPage.getRoot());
        this._mainPage = mainPage;

        // If App is in development mode add as last route alamid's default 404 Route.
        if (env.isDevelopment()) {

            pageJS("*", function display404Page(ctx) {
                default404Page = new Default404Page();
                default404Page.setTitle("404");
                default404Page.setSubTitle("Page Not Found");
                default404Page.setMessage(
                    "This is alamid's default 404 Page." +
                        "The Page is displayed because alamid is running 'development' mode."
                );
                default404Page.setInfo(ctx);
                self._mainPage.setSubPage(default404Page);
            });
        }

        this._addOnUnloadListener();

        pageJS.start(pageJSOptions);

        this._isRunning = true;
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
     * Changes the page hierarchy according to the given pageURL.
     *
     * For instance: If the user is currently on 'home/about' and the new pageURL is 'blog/posts', the 'home'- and
     * the 'home/about'-page will be left and disposed. After that the 'blog'- and the 'blog/posts'-page will be initialized
     * and appended.
     *
     * Only those pages are changed that aren't displayed in the new state. E.g. 'blog/about' and 'blog/posts' share
     * both 'blog' as the parent page. So 'blog' won't be disposed.
     *
     * Further calls to changePage() will automatically cancel the previous page change process if still running.
     *
     * @param {!String} pageURL a string like 'blog/posts' with no leading slash
     * @param {Object.<String, String>} params the params object that will be passed to the created classes
     * @throws {TypeError}
     * @throws {Error} When one of the pages doesn't exist
     */
    changePage: function (pageURL, params) {

        var self = this,
            passedPageURL,
            pageURLs,
            pageURLsToLoad,
            pageLoader = this._activePageLoader,
            indexOfTransitionPage,
            parentOfTransitionPage,
            currentPages,
            pagesToLeave,
            preventDefault = false;

        //Make it possible that a call to .changePage() with '/' as route resolves to MainPage
        passedPageURL = pageURL;
        if (pageURL === "/") {
            pageURL = "";
        }

        if (typeof params === "undefined") {
            params = {};
        }

        preventDefault = this._emitBeforePageChange(passedPageURL, params);
        if (preventDefault) {
            return;
        }

        // Retrieve the current page hierarchy
        currentPages = this.getCurrentPages();
        // Remove main page because it can't be changed
        currentPages.shift();

        // Divide the pageURL in all pageURLs that have to be requested.
        // E.g. "blog/posts/comments" becomes ["blog", "blog/posts", "blog/posts/comments"]
        //resolvePageURLs can't resolve a single backlslash "/", it must be transformed to "".
        pageURLs = resolvePageURLs(pageURL);

        // Determines the position in the page hierarchy where the pages have to be changed.
        // E.g. A page change from 'blog/about' to 'blog/posts' would result in index = 2.
        // Hierarchy[0] is the main page.
        indexOfTransitionPage = this._getIndexOfTransitionPage(pageURLs);
        parentOfTransitionPage = currentPages[indexOfTransitionPage - 1] || this._mainPage;

        pagesToLeave = currentPages.slice(indexOfTransitionPage);
        pageURLsToLoad = pageURLs.slice(indexOfTransitionPage);

        preventDefault = this._emitLeaveEventOnPages(pagesToLeave, passedPageURL, params);
        if (preventDefault) {
            return;
        }

        //If there is a running pageLoader then cancel loading of page.
        if (pageLoader) {
            pageLoader.cancel();
        }

        this._activePageLoader = pageLoader = new PageLoader(pageURLsToLoad);
        pageLoader.load(params, function onPageLoaderFinished(err, pages) {

            var event = {
                toPageURL: passedPageURL,
                pageParams: params
            };

            self._activePageLoader = null;

            if (err) {
                throw err;
            }

            //Return to MainPage
            if (pages === undefined) {
                self._changeToMainPage();
            } else {
                self._appendPages(parentOfTransitionPage, pages);
            }

            self.emit("pageChange", event);
        });
    },

    /**
     * Determines the position in the page hierarchy where the pages have to be changed.
     * E.g. A page change from 'blog/about' to 'blog/posts' would result in index = 1.
     *
     * @param {!Array.<String>} pageURLs
     * @return {Number}
     * @private
     */
    _getIndexOfTransitionPage: function (pageURLs) {
        var page = this._mainPage,
            index = null,
            PageClass;

        _(pageURLs).find(function findTransitionPageURL(pageURL, i) {
            index = i;
            page = page.getSubPage();
            PageClass = pageRegistry.getPageClass(pageURL);
            return typeof PageClass !== "function" || value(page).notTypeOf(PageClass);
        });

        return index;
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
     * Emits 'beforePageChange' with the possibility to abort the operation via preventDefault().
     *
     * @param {String} toPageURL
     * @param {Object} pageParams
     * @return {Boolean} true if preventDefault() has been called
     * @private
     */
    _emitBeforePageChange: function (toPageURL, pageParams) {
        var preventDefault = false,
            event = {
                toPageURL: toPageURL,
                pageParams: pageParams,
                preventDefault: function () {
                    preventDefault = true;
                }
            };

        this.emit("beforePageChange", event);

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
     * Calls setSubPage() on every page with the next item in the array.
     *
     * @param {Page} parentPage
     * @param {Array.<Page>} pages
     * @private
     */
    _appendPages: function (parentPage, pages) {

        _(pages).each(function appendPage(page) {
            parentPage.setSubPage(page);
            parentPage = page;
        });

    },

    /**
     * Removes all Sub-Pages till MainPage is the last man standing
     *
     * @private
     */
    _changeToMainPage: function () {
        var currentPages = this.getCurrentPages();

        //Walk reverse of array
        currentPages.reverse();

        _(currentPages).each(function resetSubPage(page, index) {
            //Skip first(===reversed last) page, because it has no Sub-Page
            if (index !== 0) {
                page.setSubPage(null);
            }
        });
    },

    /**
     * Initializes socket.io
     *
     * @private
     */
    _initSocket: function () {

        if (typeof io === "undefined") {
            throw new ReferenceError("(alamid) window.io is not defined: Add socket io to your scripts or " +
                "disable Websockets in your alamid config");
        }
        this.socket = io.connect();

    },

    /**
     * Creates a context-Object out of current location
     *
     * @param {string} path (optional - defaults to location.pathname)
     * @param {object} state (optional)
     * @return {Object}
     *
     * @see https://github.com/visionmedia/page.js
     *
     * @private
     */
    getContext: function (path, state) {

        var base = pageJS.base();

        path = path || location.pathname;

        function Context(path, state) {
            if ('/' === path[0] && 0 !== path.indexOf(base)) {
                path = base + path;
            }
            var i = path.indexOf('?');
            this.canonicalPath = path;
            this.path = path.replace(base, '') || '/';
            this.title = document.title;
            this.state = state || {};
            this.state.path = path;
            this.querystring = ~i ? path.slice(i + 1) : '';
            this.pathname = ~i ? path.slice(0, i) : path;
            this.params = [];
        }

        return new Context(path, state);
    }
});

module.exports = Client;