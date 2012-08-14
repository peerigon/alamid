"use strict";

var Page = require("../../../lib/client/Page.class.js");

console.log(Page.define);
console.log(Page.$define);

var PageExample = Page.define({

    /**
     * Exposes protected ._getParams()
     *
     * @return {Object}
     */
    getParams: function () {
        return this._getParams();
    },

    $template: "<div data-node='page'></div>"

});

module.exports = PageExample;