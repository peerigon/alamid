"use strict";

module.exports = function (exports) {
    exports.util.underscore = require("underscore");
    exports.util.jQuery = require("./client/helpers/jQuery.js");

    exports.DisplayObject = require("./client/DisplayObject.class.js");
    exports.View = require("./client/View.class.js");
    exports.ViewCollection = require("./client/ViewCollection.class.js");
    exports.Page = require("./client/Page.class.js");
};