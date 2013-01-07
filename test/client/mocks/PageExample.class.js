"use strict";

var Page = require("../../../lib/client/Page.class.js");

var PageExample = Page.extend("PageExample", {

    template: "<div data-node='page'></div>",

    /**
     * Exposes protected ._getParams()
     * @return {object}
     */
    getParams: function () {
        return this._params;
    },

    /**
     * Exposes ._isDisposed()
     * @return {boolean}
     */
    isDisposed: function () {
        return this._isDisposed;
    }

});


module.exports = PageExample;