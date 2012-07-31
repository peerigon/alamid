"use strict";

var _ = require("underscore"),
    Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    EventEmitter = require("../shared/EventEmitter.class.js"),
    Page = require("./Page.class.js"),
    PageLoader = require("./PageLoader.class.js"),
    pageJS = require("page"),
    historyJS = require("history.js"),
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
            throw new Error("(alamid)");
        }

        this.mainPage = mainPage;

        module.exports = App = this.Instance;    // make App a singleton
    },

    route: function (route, handler) {
        var pageURL;

        if (is(handler).instanceOf(String)) {
            pageURL = handler;
            handler = function handleRoute(ctx, next) {
                App.loadPage(pageURL, ctx.params);
            };
        } else if (is(handler).notInstanceOf(Function)) {
            throw new TypeError("(alamid) Cannot register route: The handler must be a string or a function. " +
                "Instead saw typeof '" + typeof handler + "'");
        }

        pageJS(route, handler);

        return this.Instance;
    },

    changePage: function (pageURL, params) {
        var self = this,
            pageURLs,
            pageLoader = this.__activePageLoader,
            indexOfTransitionPage,
            parentOfTransitionPage,
            currentPages = this.getCurrentPages(),
            pagesToLeave,
            cancelled = false;

        cancelled = this.__emitBeforePageChange();
        if (cancelled) {
            return;
        }

        pageURLs = resolvePageURLs(pageURL);
        indexOfTransitionPage = this.__getIndexOfTransitionPage(pageURLs);
        parentOfTransitionPage = indexOfTransitionPage === 0?
            this.mainPage:
            currentPages[indexOfTransitionPage - 1];
        pagesToLeave = currentPages.slice(indexOfTransitionPage);

        cancelled = this.__emitLeaveEventOnPages(pagesToLeave);
        if (cancelled) {
            return;
        }

        if (pageLoader) {
            pageLoader.cancel();
        }

        this.__activePageLoader = pageLoader = new PageLoader(pageURLs);
        pageLoader.load(params, function onPageLoaderFinished(err, pages) {
            if (err) {
                throw err;
            }

            self.Super.emit("pageChange");
            self.__emitEnterEventOnPages(pages);
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
            event = {
                preventDefault: function () {
                    preventDefault = true;
                }
            };

        _(pages).each(function emitLeaveEvent(page) {
             page.emit("leave", event);
        });

        return preventDefault;
    },

    __emitEnterEventOnPages: function (pages) {
        _(pages).each(function emitLeaveEvent(page) {
             page.emit("enter", event);
        });
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
    }
});

module.exports = App;