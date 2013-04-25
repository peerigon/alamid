"use strict";

var value = require("value");

function escaper(field) {
    var fieldValue = value(field);

    if (fieldValue.typeOf(String)) {
        return String(field)
            .replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\//g,'&#47;');
    } else if (fieldValue.isNotSet() || fieldValue.typeOf(Function)) {
        return '';
    }

    return field;
}

module.exports = escaper;