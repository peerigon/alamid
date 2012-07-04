"use strict";

var path = require("path"),
    nodeclass = require("nodeclass"),
    compile = require("nodeclass").compile;

var absoluteCompileTestAlamidPath = path.resolve("../testHelpers/compileTestAlamid.js"),
    ChildDisplayObjectLib = __dirname + "/DisplayObject/lib",
    ChildDisplayObjectCompiled = __dirname + "/DisplayObject/compiled";

exports.before = function () {

    delete require.cache[absoluteCompileTestAlamidPath];

    //Compile alamid lib
    console.time("compile alamid");
    require("../testHelpers/compileTestAlamid.js");
    console.timeEnd("compile alamid");

    //Compile ChildDisplayObject
    console.time("compile ChildDisplayObject.class.js");
    compile(ChildDisplayObjectLib, ChildDisplayObjectCompiled);
    console.timeEnd("compile ChildDisplayObject.class.js");

};