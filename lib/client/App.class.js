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
            cancelled = false,
            eventObj = {
                preventDefault: function () {
                    cancelled = true;
                }
            };

        this.Super.emit("beforePageChange", eventObj);

        if (cancelled) {
            return;
        }

        if (pageLoader) {
            pageLoader.cancel();
        }

        pageURLs = resolvePageURLs(pageURL);
        indexOfTransitionPage = this.__getIndexOfTransitionPage(pageURLs);
        if (indexOfTransitionPage === 0) {
            parentOfTransitionPage = this.mainPage;
        } else {
            parentOfTransitionPage = this.getCurrentPageAt(indexOfTransitionPage - 1);
        }

        this.__activePageLoader = pageLoader = new PageLoader(parentOfTransitionPage, pageURLs);
        pageLoader.load(params, function onPageLoaderFinished() {
            self.Super.emit("pageChange");
        });
    },

    getCurrentPageHierarchy: function () {
        var page = this.mainPage,
            result = [page];

        while ((page = page.getSubPage())) {
            result.push(page);
        }

        return result;
    },

    getCurrentPageAt: function (level) {
        var hierarchy = this.getCurrentPageHierarchy();

        return hierarchy[level];
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
    }
});

module.exports = App;