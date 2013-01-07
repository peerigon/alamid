"use strict";

var View = require("../../../lib/client/View.class.js");

var ViewDefineExample = View.extend("ViewDefineExample", {

    /**
     * @type {Function}
     */
    __done: null,

    /**
     * @param {Function} done
     */
    constructor: function (done) {
        var template = "<div data-role='page'></div>";

        this._super(template);
        this.__done = done;
    },

    executeDone: function () {
        this.__done();
    }

});

module.exports = ViewDefineExample;