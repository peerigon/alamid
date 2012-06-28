"use strict"; // run code in ES5 strict mode

/**
 * Matches:
 * All valid occurrences of "url()" in CSS files.
 *
 * Captures:
 * - the content of url() without quotes
 */
module.exports = function extractURLsFromCSS() {

    // @TODO return matches
    return /url\(\s*(?:"([^"]+)"|'([^']+)')\s*\)/;
};