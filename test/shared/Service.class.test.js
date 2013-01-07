"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    value = require("value");

var Service = require("../../lib/shared/Service.class.js");

describe("Service", function() {

    var BlogService,
        blogServiceInstance;

    before(function() {
        BlogService = require("./Service/BlogService.class.js");
    });

});