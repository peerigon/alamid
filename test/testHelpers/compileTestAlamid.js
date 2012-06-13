"use strict"; // run code in ES5 strict mode

var compile = require("nodeclass").compile,
    path = require("path");

var alamidPath = path.resolve(__dirname, "../../");

compile(alamidPath + "/lib", alamidPath + "/compiled");
