"use strict";

var Class = require("nodeclass").Class;

var Page = require("../Page.class.js");

var Default404Page = new Class({

    Extends: Page,

    init: function () {

        this.Super(
            "<div data-node='page'>" +
                "<h2 data-node='title'></h2>" +
                "<p data-node='message'></p>" +
            "</div>"
        );

    },

    setTitle: function (title) {
        this.Super.getNodeMap().title.textContent = title;

        return this.Instance;
    },

    setMessage: function () {
        this.Super.getNodeMap().message.textContent = title;

        return this.Instance;
    }

});

module.exports = Default404Page;