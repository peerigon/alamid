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

    describe("#setStatusCode", function() {

        it("should set the statusCode", function() {

           myResponse = new Response();
           expect(myResponse.getStatusCode()).to.be(null);
           myResponse.setStatusCode(200);
           expect(myResponse.getStatusCode()).to.be(200);
        });
    });


});