"use strict";

var DisplayObject = require("../../../lib/client/DisplayObject.class.js");

var DisplayObjectDefineExample = DisplayObject.define("DisplayObjectDefineExample", {

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

module.exports = DisplayObjectDefineExample;