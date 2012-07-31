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

    //Change it from public to private as it was use as private in setSubPage()
    __subPage: null, //Do you mean current subPage? It is possible that there are more subPages.

    $main: null, //Is this the reference to the main page?

    $load: function (pageURL, params) {
        var pageURLs;

        params = params || {};
        currentLoadId++;
        pageURLs = resolvePageURLs(pageURL);
        changePages(pageURLs, params, currentLoadId);
    },

    /**
     * @param {Page} subPage
     */
    setSubPage: function (subPage) {
        var self;

        if (is(subPage).notInstanceOf(Page)) {
            throw new TypeError("(alamid) Cannot set new subpage: The subpage must be an instance of Page");
        }

        //Why should the page be completely destroyed. I think it is useful to keep it somewhere.
        //This way the page mustn't be loaded again on "back-button"
        if (this.__subPage) {
            this.__subPage.dispose();
        }

        //@TODO: two event listeners are needed here if the DisplayObject is not refactored
        // https://github.com/peerigon/alamid/issues/54
        subPage.once("destroy", function onDestroy() {
            self.__subPage = null;
        });

        this.Super._append(subPage).at("page");

        this.__subPage = subPage; //I've added this line, because otherwise __subPage won't be never set.

        this.Super.emit("subPageChanged", subPage);
    },

    getAllSubPages: function () {
        //TODO invokes getAllSubPages() recursively on the sub page and returns an array with all sub pages
    }
});

//@TODO Make this function static
//That should be not a part of the page

}

module.exports = Page;