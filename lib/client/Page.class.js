"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    DisplayObject = require("./DisplayObject.class.js"),
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

    init: function (params, template) {
        this.Super(template);
    },

    /**
     * @param {Page} subPage
     */
    setSubPage: function (subPage, transitionHandler) {
        var prevSubPage;

        function disposePrevSubPage() {
            prevSubPage.dispose();
        }

        if (is(subPage).notInstanceOf(Page)) {
            throw new TypeError("(alamid) Cannot set new subpage: The subpage must be an instance of Page");
        }

        prevSubPage = this.__subPage;

        this.Super._append(subPage).at("page");

        if (prevSubPage) {
            if (transitionHandler === undefined && subPage.constructor.animations) {
                transitionHandler = subPage.constructor.animations.transition;
            }
            if (transitionHandler) {
                transitionHandler(prevSubPage.getNode(), subPage.getNode(), disposePrevSubPage);
            } else {
                disposePrevSubPage();
            }
        }

        this.__subPage = subPage;
    },

    getSubPage: function () {
        return this.__subPage;
    }
});



module.exports = Page;