"use strict";

/** @typedef {{preventDefault: Function}} */
var PageChangeEvent,
/** @typedef {} */
    Socket;

var _ = require("underscore"),
    Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    config = require("./config.client.js"),
    EventEmitter = require("../shared/EventEmitter.class.js"),
    Page = require("./Page.class.js"),
    PageLoader = require("./PageLoader.class.js"),
    pageJS = require("./helpers/page.js"),
    historyAdapter = require("./helpers/historyAdapter.js"),
    resolvePageURLs = require("../shared/helpers/resolvePageURLs.js"),
    pageRegistry = require("./registries/pageRegistry.js"),
    domAdapter = require("./helpers/domAdapter.js");

/**
 * @class App
 * @extends EventEmitter
 */
var App = new Class({

    Extends: EventEmitter,

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
    __mainPage: null,

    /**
     * @private
     * @type {Function}
     */
    __mainPageClass: null,

    /**
     * @private
     * @type {PageLoader}
     */
    __activePageLoader: null,

    /**
     * @param {!Function} MainPageClass
     * @throws {TypeError}
     * @constructor
     */
    init: function (MainPageClass) {

        if (is(MainPageClass).notInstanceOf(Function)) {
            throw new TypeError("(alamid) Cannot init App: The MainPageClass must be a function.");
        }

        this.__mainPageClass = MainPageClass;

    },

    /**
     * return the socket.io instance
     *
     * @return {*}
     */
    getSocket : function() {
        return this.socket;
    },

    /**
     * Returns the current page hierarchy including the main page at index 0.
     *
     * @return {Array.<Page>}
     */
    getCurrentPages: function () {
        var page = this.__mainPage,
            result = [page];

        while ((page = page.getSubPage())) {
            result.push(page);
        }

        return result;
    },

    /**
     * Returns the main page.
     *
     * @return {Page}
     */
    getMainPage: function () {
        return this.__mainPage;
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
     * @return {App} the instance
     */
    addRoute: function (route, handler) {
        var pageURL,
            self = this;

        if (is(handler).instanceOf(String)) {
            pageURL = handler;
            handler = function handleRoute(ctx) {
                self.changePage(pageURL, ctx.params);
            };
        } else if (is(handler).notInstanceOf(Function)) {
            throw new TypeError("(alamid) Cannot register route: The handler must be a string or a function. " +
                "Instead saw typeof '" + typeof handler + "'");
        }

        pageJS(route, handler);

        return this.Instance;
    },

    /**
     * Initializes the main page, registers event listeners for route changes and
     * dispatches the first route according to window.location
     */
    start: function () {
        var MainPageClass = this.__mainPageClass,
            mainPage,
            mainPageParentNode = domAdapter(document.body).find('[data-node="page"]')[0];

        if (!mainPageParentNode) {
            throw new Error("(alamid) Cannot start app: Could not find an element with data-node=\"page\" under document.body");
        }

        if (config.useWebsockets && this.socket === null) {
            this.__initSocket();
        }

        // Passing an empty object as params to keep the Page.init()-signature consistent.
        // Because the MainPage is the very first page, there are no params.
        mainPage = new MainPageClass({});
        mainPage.emit("beforeAdd");
        mainPageParentNode.appendChild(mainPage.getNode());
        mainPage.emit("add");
        this.__mainPage = mainPage;

        //TODO Register event listeners
        // - popstate

        //TODO add default behavior if no route matched

        pageJS("*", function handleDefaultRoute(ctx) {
            //TODO resolve url to pages
            //TODO 404?
        });

        pageJS.start({
            historyAdapter: historyAdapter
        });
    },

    /**
     * Stops route handling
     */
    stop: function () {
        pageJS.stop();
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
            pageURLs,
            pageURLsToLoad,
            pageLoader = this.__activePageLoader,
            indexOfTransitionPage,
            parentOfTransitionPage,
            currentPages,
            pagesToLeave,
            cancelled = false;

        cancelled = this.__emitBeforePageChange();
        if (cancelled) {
            return;
        }

        // Retrieve the current page hierarchy
        currentPages = this.getCurrentPages();
        // Remove main page because it can't be changed
        currentPages.shift();

        // Divide the pageURL in all pageURLs that have to be requested.
        // E.g. "blog/posts/comments" becomes ["blog", "blog/posts", "blog/posts/comments"]
        pageURLs = resolvePageURLs(pageURL);

        // Determines the position in the page hierarchy where the pages have to be changed.
        // E.g. A page change from 'blog/about' to 'blog/posts' would result in index = 2.
        // Hierarchy[0] is the main page.
        indexOfTransitionPage = this.__getIndexOfTransitionPage(pageURLs);
        parentOfTransitionPage = currentPages[indexOfTransitionPage - 1] || this.__mainPage;

        pagesToLeave = currentPages.slice(indexOfTransitionPage);
        pageURLsToLoad = pageURLs.slice(indexOfTransitionPage);

        cancelled = this.__emitLeaveEventOnPages(pagesToLeave);
        if (cancelled) {
            return;
        }

        if (pageLoader) {
            pageLoader.cancel();
        }

        if (typeof params !== "object") {
            params = {};
        }

        this.__activePageLoader = pageLoader = new PageLoader(pageURLsToLoad);
        pageLoader.load(params, function onPageLoaderFinished(err, pages) {
            self.__activePageLoader = null;

            if (err) {
                throw err;
            }

            self.__appendPages(parentOfTransitionPage, pages);

            self.Super.emit("pageChange");
        });
    },

    /**
     * Dispatches the given route and gives control to the route handlers that match to the given route.
     *
     * @param {!String} route
     */
    dispatchRoute: function (route) {
        pageJS(route);
    },

    /**
     * Determines the position in the page hierarchy where the pages have to be changed.
     * E.g. A page change from 'blog/about' to 'blog/posts' would result in index = 1.
     *
     * @param {!Array.<String>} pageURLs
     * @return {Number}
     * @private
     */
    __getIndexOfTransitionPage: function (pageURLs) {
        var page = this.__mainPage,
            index = null,
            PageClass;

        _(pageURLs).find(function findTransitionPageURL(pageURL, i) {
            index = i;
            page = page.getSubPage();
            PageClass = pageRegistry.getPageClass(pageURL);
            return typeof PageClass !== "function" || is(page).notInstanceOf(PageClass);
        });

        return index;
    },

    /**
     * Emits 'beforeLeave' with the possibility to abort the operation via preventDefault().
     * The events will be emitted on every page in the array from right to left (bottom -> top).
     *
     * @param {Array.<Page>} pages
     * @return {Boolean} true if preventDefault() has been called
     * @private
     */
    __emitLeaveEventOnPages: function (pages) {
        var preventDefault = false,
            page,
            i,
            event = {
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
     * @return {Boolean} true if preventDefault() has been called
     * @private
     */
    //@TODO pass route on beforePageChange
    __emitBeforePageChange: function () {
        var preventDefault = false,
            eventObj = {
                preventDefault: function () {
                    preventDefault = true;
                }
            };

        this.Super.emit("beforePageChange", eventObj);

        return preventDefault;
    },

    /**
     * Calls setSubPage() on every page with the next item in the array.
     *
     * @param {Array.<Page>} pages
     * @private
     */
    __appendPages: function (parentPage, pages) {
        _(pages).each(function (page) {
            parentPage.setSubPage(page);
            parentPage = page;
        });
    },

    __initSocket: function () {
        this.socket = io.connect();
    }
});

module.exports = App;