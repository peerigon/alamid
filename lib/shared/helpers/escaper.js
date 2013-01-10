"use strict";

function escaper(value) {
    if (value === undefined || value === null) {
        return '';
    } else if (typeof value === 'function') { // IF TRUE: Its a constructor function, thus a default value
        return '';
    } else if (value instanceof Date) {
        return String(value.getTime());
    }

    value = String(value); // cast to string

    // These replace patterns are taken from the great Backbone.js
    // project. Please check out: http://documentcloud.github.com/backbone/
    return value.replace(/&(?!\w+;|#\d+;|#x[\da-f]+;)/gi, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\//g,'&#47;');
}

module.exports = escaper;