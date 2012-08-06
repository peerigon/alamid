"use strict";

var _ = require("underscore"),
    Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    EventEmitter = require("../shared/EventEmitter.class.js"),
    Page = require("./Page.class.js"),
    PageLoader = require("./PageLoader.class.js"),
    pageJS = require("page"),
    resolvePageURLs = require("../shared/helpers/resolvePaths.js").resolvePageURLs,
    pageRegistry = require("../shared/registries/pageRegistry.js");

var App = new Class({

    Extends: EventEmitter,

    /**
     * @type {Page}
     * @public
     */
    mainPage: null,

    __activePageLoader: null,

    /**
     * @param {Page} mainPage
     * @constructor
     */
    init: function (mainPage) {

        if (is(mainPage).notInstanceOf(Page)) {
            throw new TypeError("(alamid) Cannot init app: The app needs a reference to the main page.");
        }

        pageJS({
            // Don't enable pageJS default event listeners.
            // We're triggering pageJS manually by App.dispatchRoute()
            click: false,
            popstate: false,
            dispatch: false
        });

        this.mainPage = mainPage;
    },

    route: function (route, handler) {
        var pageURL;

        if (is(handler).instanceOf(String)) {
            pageURL = handler;
            handler = function handleRoute(ctx) {
                App.changePage(pageURL, ctx.params);
            };
        } else if (is(handler).notInstanceOf(Function)) {
            throw new TypeError("(alamid) Cannot register route: The handler must be a string or a function. " +
                "Instead saw typeof '" + typeof handler + "'");
        }

        pageJS(route, handler);

        return this.Instance;
    },

    start: function () {
        //TODO Register event listeners
        // - click
        // - popstate

    },

    changePage: function (pageURL, params) {
        var self = this,
            pageURLs,
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

        currentPages = this.getCurrentPages();
        pageURLs = resolvePageURLs(pageURL);
        indexOfTransitionPage = this.__getIndexOfTransitionPage(pageURLs);
        parentOfTransitionPage = indexOfTransitionPage === 0?
            this.mainPage:
            currentPages[indexOfTransitionPage - 1];
        pagesToLeave = currentPages.slice(indexOfTransitionPage + 1);

        cancelled = this.__emitLeaveEventOnPages(pagesToLeave);
        if (cancelled) {
            return;
        }

        if (pageLoader) {
            pageLoader.cancel();
        }

        this.__activePageLoader = pageLoader = new PageLoader(pageURLs);
        pageLoader.load(params, function onPageLoaderFinished(err, pages) {
            self.__activePageLoader = null;

            if (err) {
                throw err;
            }

            parentOfTransitionPage.setSubPage(pages[0]);
            self.__appendPages(pages);

            self.Super.emit("pageChange");
        });
    },

    getCurrentPages: function () {
        var page = this.mainPage,
            result = [page];

        while ((page = page.getSubPage())) {
            result.push(page);
        }

        return result;
    },

    dispatchRoute: function (route) {
        pageJS(route);
    },

    __getIndexOfTransitionPage: function (pageURLs) {
        var page = this.mainPage,
            index = -1,
            PageClass;

        _(pageURLs).find(function findTransitionPageURL(pageURL, i) {
            index = i;
            page = page.getSubPage();
            PageClass = pageRegistry.getPageClass(pageURL);
            return typeof PageClass !== "function" || is(page).notInstanceOf(PageClass);
        });

        return index;
    },

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
            page.emit("leave", event);
            if (preventDefault) {
                break;  // stop emitting the leave event, the current page takes the control flow
            }
        }

        return preventDefault;
    },

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

    __appendPages: function (pages) {
        var subPage;

        _(pages).each(function (page, index) {
            subPage = pages[index + 1];
            if (subPage) {
                page.setSubPage(subPage);
            }
        });
    }
});

module.exports = App;