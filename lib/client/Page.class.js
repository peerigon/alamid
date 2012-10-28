"use strict"; // run code in ES5 strict mode

var Class = require("nodeclass").Class,
    NodeClass = Class,
    is = require("nodeclass").is,
    DisplayObject = require("./DisplayObject.class.js"),
    _ = require("underscore");

var Page = new Class("Page", {

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
     * Returns a Class instance of Page
     *
     * @param {!String} className
     * @param {!Object} descriptor
     * @return {Function}
     * @static
     */
    $define: function (className, descriptor) {

        descriptor.Extends = Page;

        return new NodeClass(className, descriptor);
    },

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
     * Sets a Sub-Page
     *
     * @param {Page|null} subPage
     */
    setSubPage: function (subPage, transitionHandler) {
        var prevSubPage;

        function disposePrevSubPage() {
            prevSubPage.dispose();
        }

        if (is(subPage).notInstanceOf(Page) && subPage !== null) {
            throw new TypeError(
                "(alamid) Cannot set type of " + typeof subPage +" as new Sub-Page: " +
                "The Sub-Page must be an instance of Page or null."
            );
        }

        prevSubPage = this.__subPage;

        if (subPage !== null) {
            this.Super._append(subPage).at("page");
        }

        if (prevSubPage) {
            /*
            if (transitionHandler === undefined && subPage.Class.animations) {
                transitionHandler = subPage.constructor.animations.transition;
            }
            if (transitionHandler) {
                transitionHandler(prevSubPage.getNode(), subPage.getNode(), disposePrevSubPage);
            } else {
                disposePrevSubPage();
            }
            */
            disposePrevSubPage()
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