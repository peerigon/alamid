"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    DisplayObject = require("./DisplayObject.class.js"),
    PageInitializer = require("./PageInitializer.class.js"),
    resolvePageURLs = require("../shared/helpers/resolvePaths.js").resolvePageURLs,
    pageRegistry = require("../shared/registries/pageRegistry.js"),
    _ = require("underscore");

/**
 * The currentLoadId is incremented every time Page.load() is called.
 * This is necessary to abort callbacks when Page.load() itself has been called in the meantime.
 *
 * @type {Number}
 */
var currentLoadId = -1;

var Page = new Class({
    Extends: DisplayObject,
    subPage: null,
    $main: null,
    $load: function (pageURL, params) {
        var pageURLs;

        params = params || {};
        currentLoadId++;
        pageURLs = resolvePageURLs(pageURL);
        changePages(pageURLs, params, currentLoadId);
    },
    setSubPage: function (subPage) {
        var currentSubPage,
            self;

        if (is(subPage).notInstanceOf(Page)) {
            throw new TypeError("(alamid) Cannot set new subpage: The subpage must be an instance of Page");
        }

        currentSubPage = this.__subPage;

        if (currentSubPage) {
            currentSubPage.dispose();
        }

        //@TODO: two event listeners are needed here if the DisplayObject is not refactored
        // https://github.com/peerigon/alamid/issues/54
        subPage.once("destroy", function () {
            self.__subPage = null;
        });

        this.Super._append(subPage).at("page");
    }
});

function changePages(pageURLs, params, loadId) {
    var page,
        pageURL,
        pagesToChange,
        newPages,
        indexOfFirstPageToChange,
        staticPage,
        i,
        event,
        PageClass;

    function isAborted() {
        var callDispose = false;

        if (currentLoadId === loadId) {
            return false;
        } else {
            for (i = indexOfFirstPageToChange; i < newPages.length; i++) {
                page = newPages[i];
                if (!page) {
                    callDispose = true;
                }
                if (page && callDispose) {
                    page.dispose();
                }
            }

            return true;
        }
    }

    function append(page, index) {
        var subPage,
            parentPage;

        newPages[index] = page;
        subPage = newPages[index + 1];
        parentPage = newPages[index - 1];
        if (parentPage) {
            parentPage.setSubPage(page);
        }
        if (subPage) {
            page.setSubPage(subPage);
        }
    }

    function initializePage(pageURL, index) {
        var pageInitializer = new PageInitializer(pageURL);

        pageInitializer.on("init", function onPageInit(page) {
            if (isAborted()) {
                return;
            }
            append(page, index);
        });
        pageInitializer.load(params);
    }

    event = {
        preventDefault: function () {
            loadId = -1;
        }
    };

    page = Page.main;
    for (i = 0; i < pageURLs.length; i++) {
        pageURL = pageURLs[i];
        staticPage = page;
        page = staticPage.getSubPage();
        PageClass = pageRegistry.getPageClass(pageURL);
        if (typeof PageClass !== "function" || is(page).notInstanceOf(PageClass)) {
            indexOfFirstPageToChange = i;
            break;
        }
    }

    pagesToChange = [];
    newPages = [];
    while (page) {
        pagesToChange.push(page);
        page = page.getSubPage();
    }

    for (i = pagesToChange.length - 1; i < 0; i--) {
        page = pagesToChange[i];
        page.emit("change", event);
        if (isAborted()) {
            return;
        }
    }

    newPages[indexOfFirstPageToChange - 1] = staticPage;
    for (i = indexOfFirstPageToChange; i < pageURLs.length; i++) {
        initializePage(pageURLs[i], i);
    }
}

module.exports = Page;