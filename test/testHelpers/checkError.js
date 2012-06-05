"use strict";

var expect = require("expect.js");

/**
 * Returns a function that checks, if the passed error was created by the
 * given ErrorConstructor
 *
 * @param {!Function} ErrorConstructor
 * @return {Function}
 */
function checkError(ErrorConstructor) {
    return function (err) {
        expect(err instanceof ErrorConstructor).to.be(true);
    };
}

module.exports = checkError;