"use strict"; // run code in ES5 strict mode

var value = require("value"),
    Displayable = require("./Displayable.class.js"),
    _ = require("underscore");

var Page = Displayable.extend("Page", {

    /**
     * @type {Page}
     * @private
     */
    _subPage: null,

    /**
     * @type {Object}
     * @protected
     */
    _params: null,

    /**
     * @param {Object} params
     * @param {String=} template (optional)
     */
    constructor: function (params, template) {

        this._super(template);
        //Make params available for Pages that inherit from Page
        this._params = params;

    },

    /**
     * Sets a Sub-Page
     *
     * @param {Page|null} subPage
     */
    setSubPage: function (subPage) {
        var prevSubPage;

        if (value(subPage).notTypeOf(Page) && subPage !== null) {
            throw new TypeError(
                "(alamid) Cannot set type of " + typeof subPage +" as new Sub-Page: " +
                "The Sub-Page must be an instance of Page or null."
            );
        }

        prevSubPage = this._subPage;

        if (subPage !== null) {
            this._append(subPage).at("page");
        }

        if (prevSubPage) {
            prevSubPage.dispose();
        }

        this._subPage = subPage;
    },

    /**
     * @return {Page}
     */
    getSubPage: function () {
        return this._subPage;
    }
});



module.exports = Page;