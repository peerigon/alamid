"use strict"; // run code in ES5 strict mode

/**
 * Matches:
 * All valid occurences of "url()" in CSS files.
 *
 * Captures:
 * - the content of url() without quotes
 *
 * @return {RegExp}
 */
module.exports = function () {
    return /url\(\s*(?:"([^"]+)"|'([^']+)')\s*\)/;
};