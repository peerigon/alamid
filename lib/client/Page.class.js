"use strict"; // run code in ES5 strict mode

var value = require("value"),
    Displayable = require("./Displayable.class.js"),
    _ = require("underscore");

var Page = Displayable.extend("Page", {

    /**
     * @type {String}
     */
    template: '<div data-node="page"></div>',

    /**
     * @type {Object}
     */
    context: null,

    /**
     * @type {Displayable}
     * @private
     */
    _subPage: null,

    /**
     * @param {Object} context
     * @param {String=} node (optional)
     */
    constructor: function (context, node) {
        this._super(node);
        this.context = context;
    },

    /**
     * Sets a Sub-Page
     *
     * @param {Displayable|null} subPage
     */
    setSubPage: function (subPage) {
        var prevSubPage;

        prevSubPage = this._subPage;

        if (subPage) {
            this.append(subPage).at("page");
        }

        if (prevSubPage) {
            prevSubPage.dispose();
        }

        this._subPage = subPage;

        return this;
    },

    /**
     * @return {Page}
     */
    getSubPage: function () {
        return this._subPage;
    },

    dispose: function () {

        this._super();
        // We don't need to dispose the subPage because this is done by the Displayable
        this._subPage = null;
        this.context = null;
    }
});



module.exports = Page;