"use strict";

var Page = require("../../../lib/client/Page.class.js");

var PageDefineExample = Page.extend("PageDefineExample", {

    /**
     * @type {Function}
     */
    __done: null,

    /**
     * @param {Function} done
     */
    constructor: function (done) {
        var params = {},
            template = "<div data-role='page'></div>";

        this._super(params, template);

        this.__done = done;
    },

    executeDone: function () {
        this.__done();
    }

});

module.exports = PageDefineExample;