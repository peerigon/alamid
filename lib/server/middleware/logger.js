"use strict";

var morgan = require("morgan");

morgan.token("transport", function getMethodToken(req) {
    return req.transport || "http";
});

morgan.format("alamid", function alamidFormatLine(tokens, req, res) {
    // get the status code if response written
    var status = res._header
        ? res.statusCode
        : undefined;

    // get status color
    var color = status >= 500 ? 31 // red
        : status >= 400 ? 33 // yellow
        : status >= 300 ? 36 // cyan
        : status >= 200 ? 32 // green
        : 0; // no color

    // get colored function
    var fn = alamidFormatLine[color];

    if (!fn) {
        // compile
        fn = alamidFormatLine[color] = morgan.compile("\x1b[0m:method :url \x1b["
            + color + "m:status \x1b[0m:response-time ms [:transport] \x1b[0m")
    }

    return fn(tokens, req, res)
});

module.exports = morgan("alamid");