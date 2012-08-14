"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    is = require("nodeclass").is,
    DisplayObject = require("./DisplayObject.class.js"),
    _ = require("underscore");

var Page = new Class({

    Extends: DisplayObject,

    /**
     * @type {Page}
     * @private
     */
    __subPage: null,

    /**
     * @type {Object}
     * @protected
     */
    _params: null,

    /**
     * @param {Object} params
     * @param {String=} template (optional)
     */
    init: function (params, template) {

        this.Super(template);
        //Make params available for Pages that inherit from Page
        this._params = params;

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

    /**
     * @return {Page}
     */
    getSubPage: function () {
        return this.__subPage;
    }
});



module.exports = Page;