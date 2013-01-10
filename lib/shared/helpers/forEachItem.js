"use strict";

/**
 * apply valueHandler function on each item
 *
 * @param {!Array} items
 * @param {!Function} valueHandler
 * @return {*}
 */
function forEachItem(items, valueHandler) {

    var key,
        i, l,
        result;

    if (items.length === 1) {
        return valueHandler(items[0]);
    }

    result = {};

    for (i = 0, l = items.length; i < l; i++) {
        key = items[i];
        result[key] = valueHandler.apply(null, [key]);
    }

    return result;
}

module.exports = forEachItem;