"use strict";

var alamid = require("alamid"),
    View = alamid.View;

var <%= name %>View = View.define("<%= name %>View", {

    $template: require("./<%= name %>View.html"),

    __nodeMap: null,

    init: function () {
        this.Super();
        this.__nodeMap = this.Super._getNodeMap();
    }
});