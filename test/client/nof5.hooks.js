"use strict";

var path = require("path");

var absoluteCompileTestAlamidPath = path.resolve("../testHelpers/compileTestAlamid.js");

exports.before = function () {
    console.time("compile alamid");
    require("../testHelpers/compileTestAlamid.js");
    console.timeEnd("compile alamid");
    delete(require.cache[absoluteCompileTestAlamidPath]);
};