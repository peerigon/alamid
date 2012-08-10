"use strict";

var _ = require("underscore"),
    domAdapter = require('./domAdapter');

/**
 * @param {Node} node
 */
function prepareLinks(node) {

    var aNodes;

    aNodes = domAdapter(node).find("a");

    _(aNodes).each(function preventPageReload (aNode) {
        domAdapter(aNode).on("click", function onClick(event) {
            event.stopPropagation();

            return false;
        });
    });

}

module.exports = prepareLinks;