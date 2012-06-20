"use strict"; // run code in ES5 strict mode

var nodeclass = require("nodeclass"),
    compile = nodeclass.compile,
    path = require("path");

var alamidPath = path.resolve(__dirname, "../../");

nodeclass.stdout = function(msg) {
  //No output in test mode
};

compile(alamidPath + "/lib", alamidPath + "/compiled");
