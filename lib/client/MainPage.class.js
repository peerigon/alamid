"use strict"; // run code in ES5 strict mode

var Page = require("./Page.class.js"),
    Event = require("../shared/Event.class.js"),
    _ = require("underscore"),
    value = require("value"),
    pageRegistry = require("./registries/pageRegistry.js"),
    pathHelpers = require("../shared/helpers/pathHelpers.js"),
    resolvePageUrls = require("../shared/helpers/resolvePageUrls.js"),
    PageLoader = require("./PageLoader.class.js"),
    pageJS = require("page");

var noTrailingLeadingSlash = pathHelpers.apply.modifier("noTrailingSlash", "noLeadingSlash").on;

var MainPage = Page.extend("MainPage", {
    constructor: function () {
        this._super.apply(this, arguments);
        if (this._root === document && !this._nodes.page) {
            this._nodes.page = document.body;
        }
    },
    getSubPages: function () {
        var page = this,
            currentPages = [];

        while ((page = page.getSubPage())) {
            currentPages.push(page);
        }

        return currentPages;
    },
    setSubPages: function (newPages) {
        var parentPage = this,
            currentPages = this.getSubPages(),
            i = 0,
            currentPage,
            newPage;

        if (!newPages) {
            this.setSubPage(null);
            return this;
        }

        do {
            currentPage = currentPages[i];
            newPage = newPages[i] || null;
            if (currentPage !== newPage) {
                parentPage.setSubPage(newPage);
            }
            parentPage = newPage;
            i++;
        } while (i < newPages.length);

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
     * @param {String} pageUrl a string like 'blog/posts'
     * @param {Object.<String, String>=} context the context object that will be passed to the created classes
     */
    changePage: function (pageUrl, context) {
        var self = this,
            pageLoader = this._activePageLoader,
            remainingPages,
            pagesToUnload,
            event,
            pageUrlsArr,
            pageUrlsToLoad,
            indexOfTransitionPage,
            currentPages;

        pageUrl = "/" + noTrailingLeadingSlash(pageUrl);    // ensure that the pageUrl starts with a slash
        if (!context) {
            context = new pageJS.Context(location.pathname, pageJS.base());
        }
        context.pageUrl = pageUrl;

        event = new BeforePageChangeEvent(self, context);
        self.emit("beforePageChange", event);
        if (event.isDefaultPrevented()) {
            return;
        }

        currentPages = this.getSubPages();
        // Resolve which pages need to be loaded in order to display the given pageUrl
        // E.g. "blog/posts/comments" becomes ["blog", "blog/posts", "blog/posts/comments"]
        pageUrlsArr = resolvePageUrls(pageUrl);

        // Determines the position in the page hierarchy where the pages have to be changed.
        // E.g. A page change from 'blog/about' to 'blog/posts' would result in index = 2.
        // Hierarchy[0] is the main page.
        indexOfTransitionPage = getIndexOfTransitionPage(this, pageUrlsArr);
        remainingPages = currentPages.slice(0, indexOfTransitionPage);
        pagesToUnload = currentPages.slice(indexOfTransitionPage);

        event = emitBeforeUnloadEvent(self, pagesToUnload, context);
        if (event.isDefaultPrevented()) {
            return;
        }

        if (pageLoader) {
            pageLoader.cancel();
        }
        pageUrlsToLoad = pageUrlsArr.slice(indexOfTransitionPage);
        if (pageUrlsToLoad.length === 0) {
            finishPageChange(self, remainingPages, context);
            return;
        }

        this._activePageLoader = pageLoader = new PageLoader(pageUrlsToLoad);
        pageLoader.load(context, function onPageLoaderFinished(err, pages) {
            self._activePageLoader = null;
            if (err) {
                throw err;
            }
            finishPageChange(self, remainingPages.concat(pages), context);
        });
    }
});

/**
 * Determines the position in the page hierarchy where the pages have to be changed.
 * E.g. A page change from 'blog/about' to 'blog/posts' would result in index = 1.
 *
 * @param {Page} page
 * @param {Array.<String>} pageUrls
 * @return {Number}
 * @private
 */
function getIndexOfTransitionPage(page, pageUrls) {
    var index = 0,
        PageClass;

    _(pageUrls).find(function findIndexOfTransitionPage(pageUrl, i) {
        index = i;
        page = page.getSubPage();
        PageClass = pageRegistry.getPageClass(pageUrl);
        return typeof PageClass !== "function" || value(page).notTypeOf(PageClass);
    });

    return index;
}

function finishPageChange(self, subPages, ctx) {
    self.setSubPages(subPages);
    self.emit("pageChange", new PageChangeEvent(self, ctx));
}

function emitBeforeUnloadEvent(self, pages, ctx) {
    var event = new BeforeUnloadEvent(self, ctx),
        page,
        i;

    for (i = pages.length - 1; i >= 0 && event.isDefaultPrevented() === false; i--) {
        page = pages[i];
        page.emit("beforeUnload", event);
    }

    return event;
}

/**
 * @class BeforePageChangeEvent
 * @extends Event
 */
var BeforePageChangeEvent = Event.extend("BeforePageChangeEvent", {
    name: "BeforePageChange",
    context: null,
    constructor: function (target, ctx) {
        this._super(target);
        this.context = ctx;
    }
});

/**
 * @class PageChangeEvent
 * @extends Event
 */
var PageChangeEvent = Event.extend("PageChangeEvent", {
    name: "PageChange",
    context: null,
    constructor: function (target, ctx) {
        this._super(target);
        this.context = ctx;
    }
});

/**
 * @class BeforeUnloadEvent
 * @extends Event
 */
var BeforeUnloadEvent = Event.extend("BeforeUnloadEvent", {
    name: "BeforeUnload",
    context: null,
    constructor: function (target, ctx) {
        this._super(target);
        this.context = ctx;
    }
});

module.exports = MainPage;
