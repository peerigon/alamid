"use strict";

var DisplayObject = require("../../../lib/client/DisplayObject.class.js");

var DisplayObjectDefineExample = DisplayObject.extend("DisplayObjectDefineExample", {

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

module.exports = DisplayObjectDefineExample;