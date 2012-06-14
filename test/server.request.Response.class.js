"use strict";

require("./testHelpers/compileTestAlamid.js");

var expect = require("expect.js"),
    Response = require("../compiled/server/request/Response.class.js");


describe("Response", function() {

    var myResponse;

    describe("#Defaults", function(){

        it("should be set to null on init", function() {
            myResponse = new Response();
            expect(myResponse.getStatusCode()).to.be(null);
            expect(myResponse.getHeaders()).not.to.be(null);
            expect(myResponse.getResult()).to.be("");
        });
    });

    describe("#setResult", function() {

        it("should store the result", function() {

            myResponse = new Response();
            myResponse.setResult("myResultString");
            expect(myResponse.getResult()).to.be("myResultString");
        });
    });

    describe("#setResult", function() {

        it("should store the result", function() {

            myResponse = new Response();
            myResponse.setResult("myResultString");
            expect(myResponse.getResult()).to.be("myResultString");
        });
    });


});