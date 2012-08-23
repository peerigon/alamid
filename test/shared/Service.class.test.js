"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    is = require("nodeclass").is;

var Service = require("../../lib/shared/Service.class.js");

describe("Service", function() {

    var BlogService,
        blogServiceInstance;

    before(function() {
        BlogService = require("./Service/BlogService.class.js");
    });

    describe("$define", function() {

        it("should define a Service and return the instance", function() {

            blogServiceInstance = new BlogService();

            expect(BlogService).not.to.be(undefined);
            expect(is(blogServiceInstance).instanceOf(Service)).to.be(true);
        });
    });
});