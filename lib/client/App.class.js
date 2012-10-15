"use strict";

/** @typedef {{preventDefault: Function, toPageURL: String, pageParams: Object}} */
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
    pageJS = require("page"),
    resolvePageURLs = require("../shared/helpers/resolvePageURLs.js"),
    pageRegistry = require("./registries/pageRegistry.js"),
    domAdapter = require("./helpers/domAdapter.js"),
    Default404Page = require("./defaults/Default404Page.class.js");

/**
 * @class App
 * @extends EventEmitter
 */
var App = new Class("App", {

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
     * @private
     * @type {Boolean}
     */
    __isRunning: false,

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
            currentPages = [page];

        while ((page = page.getSubPage())) {
            currentPages.push(page);
        }

        return currentPages;
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

        //Load pages by convention. pageURLs reflect the path on the filesystem under the pages-folder.
        //The Page-Class under /app/pages/blog/posts/PostsPage.class.js becomes /blog/posts
        if (is(handler).instanceOf(String)) {
            pageURL = handler;
            handler = function handleRoute(ctx) {
                self.changePage(pageURL, ctx);
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
     *
     * @param {Object=} pageJSOptions @see http://visionmedia.github.com/page.js/
     */
    start: function (pageJSOptions) {
        var MainPageClass = this.__mainPageClass,
            mainPage,
            mainPageParentNode = domAdapter(document).find('body')[0],
            default404Page,
            self = this;

        if (!mainPageParentNode) {
            throw new Error(
                '(alamid) Cannot start app: Could not find an element with data-node="page" under document.body'
            );
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

        // If App is in development mode add as last route alamid's default 404 Route.
        if (config.mode === "development") {

            pageJS("*", function display404Page(ctx) {
                default404Page = new Default404Page();
                default404Page.setTitle("404");
                default404Page.setSubTitle("Page Not Found");
                default404Page.setMessage(
                    "This is alamid's default 404 Page." +
                    "The Page is displayed because alamid is running 'development' mode."
                );
                default404Page.setInfo(ctx);
                self.__mainPage.setSubPage(default404Page);
            });
        }

        pageJS.start(pageJSOptions);

        this.__isRunning = true;
    },

    /**
     * Dispatches the given route and gives control to the route handlers that match to the given route.
     *
     * @param {!String} route
     * @return {App}
     */
    dispatchRoute: function (route) {
        if (this.__isRunning === false) {
            this.start({dispatch: false});
        }

        pageJS(route);

        return this.Instance;
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
            pageLoader = this.__activePageLoader,
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

        preventDefault = this.__emitBeforePageChange(passedPageURL, params);
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
        indexOfTransitionPage = this.__getIndexOfTransitionPage(pageURLs);
        parentOfTransitionPage = currentPages[indexOfTransitionPage - 1] || this.__mainPage;

        pagesToLeave = currentPages.slice(indexOfTransitionPage);
        pageURLsToLoad = pageURLs.slice(indexOfTransitionPage);

        preventDefault = this.__emitLeaveEventOnPages(pagesToLeave, passedPageURL, params);
        if (preventDefault) {
            return;
        }

        //If there is a running pageLoader then cancel loading of page.
        if (pageLoader) {
            pageLoader.cancel();
        }

        this.__activePageLoader = pageLoader = new PageLoader(pageURLsToLoad);
        pageLoader.load(params, function onPageLoaderFinished(err, pages) {

            var event = {
                toPageURL: passedPageURL,
                pageParams: params
            };

            self.__activePageLoader = null;

            if (err) {
                throw err;
            }

            //Return to MainPage
            if (pages === undefined) {
                self.__changeToMainPage();
            } else {
                self.__appendPages(parentOfTransitionPage, pages);
            }

            self.Super.emit("pageChange", event);
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
     * @param {String} pageURL
     * @param {Object}
     * @return {Boolean} true if preventDefault() has been called
     * @private
     */
    __emitLeaveEventOnPages: function (pages, pageURL, params) {
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
    __emitBeforePageChange: function (toPageURL, pageParams) {
        var preventDefault = false,
            event = {
                toPageURL: toPageURL,
                pageParams: pageParams,
                preventDefault: function () {
                    preventDefault = true;
                }
            };

        this.Super.emit("beforePageChange", event);

        return preventDefault;
    },

    /**
     * Calls setSubPage() on every page with the next item in the array.
     *
     * @param {Page} parentPage
     * @param {Array.<Page>} pages
     * @private
     */
    __appendPages: function (parentPage, pages) {

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
    __changeToMainPage: function () {
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
    __initSocket: function () {
        if (typeof io === "undefined") {
            throw new ReferenceError("(alamid) window.io is not defined: Add socket io to your scripts or " +
                "disable Websockets in your alamid config");
        }
        this.socket = io.connect();
    }
});

module.exports = App;