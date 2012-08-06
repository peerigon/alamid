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
    __mainPage: null,

    __mainPageClass: null,

    __activePageLoader: null,

    /**
     * @param {Page} MainPageClass
     * @constructor
     */
    init: function (MainPageClass) {

        if (is(MainPageClass).notInstanceOf(Function)) {
            throw new TypeError("(alamid) Cannot init App: The MainPageClass must be a function.");
        }

        this.__mainPageClass = MainPageClass;

        pageJS({
            popstate: false // we're handling 'popstate' manually
        });
    },

    getCurrentPages: function () {
        var page = this.__mainPage,
            result = [page];

        while ((page = page.getSubPage())) {
            result.push(page);
        }

        return result;
    },

    getMainPage: function () {
        return this.__mainPage;
    },

    route: function (route, handler) {
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

    start: function () {
        var MainPageClass = this.__mainPageClass;

        // Passing an empty object as params to keep the Page.init()-signature consistent.
        // Because the MainPage is the very first page, there are no params.
        this.__mainPage = new MainPageClass({});

        //TODO Register event listeners
        // - popstate
        pageJS.start();
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
            this.__mainPage:
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

    dispatchRoute: function (route) {
        pageJS(route);
    },

    __getIndexOfTransitionPage: function (pageURLs) {
        var page = this.__mainPage,
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