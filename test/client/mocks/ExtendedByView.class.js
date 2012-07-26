"use strict";

var Class = require("nodeclass").Class,
    View = require("../../../lib/client/View.class.js");

var ExtendedByView = new Class({

    Extends: View,

    /**
     * Exposes protected _node. For testing purposes only
     *
     * @return {*}
     */
    getNode: function () {
        return this.Super.getNode();
    }

});

module.exports = ExtendedByView;