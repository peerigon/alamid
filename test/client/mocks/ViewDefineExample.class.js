"use strict";

var View = require("../../../lib/client/View.class.js");

var ViewDefineExample = View.define({

    /**
     * @type {Function}
     */
    __done: null,

    /**
     * @param {Function} done
     */
    init: function (done) {

        var template = "<div data-role='page'></div>";

        this.Super(template);

        this.__done = done;
    },

    executeDone: function () {
        this.__done();
    }

});

module.exports = ViewDefineExample;