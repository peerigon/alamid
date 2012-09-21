"use strict";

var Page = require("../../../lib/client/Page.class.js"),
    PageExample = require("./PageExample.class.js");

var PageDefineExample = Page.define({

    /**
     * @type {Function}
     */
    __done: null,

    /**
     * @param {Function} done
     */
    init: function (done) {

        var params = {},
            template = "<div data-role='page'></div>";

        this.Super(params, template);

        this.__done = done;
    },

    executeDone: function () {
        this.__done();
    }

});

module.exports = PageDefineExample;