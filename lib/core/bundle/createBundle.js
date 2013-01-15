"use strict";

var bundle = require("./bundle.js"),
    config = require("../../shared/config");

//simply execute
//function gets called by "runCreateBundle" in a separate process 
bundle.createBundle(config);