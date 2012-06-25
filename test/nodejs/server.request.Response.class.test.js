"use strict";

require("./testHelpers/compileTestAlamid.js");

var expect = require("expect.js"),
    Response = require("../../compiled/server/request/Response.class.js");


describe("Response", function() {

    var myResponse;

    describe("#Setters & #Getters", function() {

        beforeEach(function() {
            myResponse = new Response();
        });

        it("should be set to null on init", function() {
            expect(myResponse.getStatusCode()).to.be(null);
            expect(myResponse.getHeaders()).to.be.an("object");
        });

        it("#setStatus", function() {
            myResponse.setStatus("success");
            expect(myResponse.getStatus()).to.be("success");
            myResponse.setStatus("fail");
            expect(myResponse.getStatus()).to.be("fail");
            myResponse.setStatus("error");
            expect(myResponse.getStatus()).to.be("error");

            expect(function() { myResponse.setStatus("crazyStatus"); }).to.throwError();
        });

        it("#setStatusCode", function() {
            expect(myResponse.getStatusCode()).to.be(null);
            myResponse.setStatusCode(200);
            expect(myResponse.getStatusCode()).to.be(200);
        });

        it("#getStatusCode", function() {
            expect(myResponse.getStatusCode()).to.be(null);
            myResponse.setStatus("success");
            expect(myResponse.getStatusCode()).to.be(200);
            myResponse.setStatus("error");
            expect(myResponse.getStatusCode()).to.be(500);
            myResponse.setStatus("fail");
            expect(myResponse.getStatusCode()).to.be(500);
        });

        it("#setHeader", function() {
            var headers;
            //check default
            myResponse.setHeader("headerKey", "headerValue");
            headers = myResponse.getHeaders();
            expect(headers.http.headerKey).to.be("headerValue");
            myResponse.setHeader("anotherHeaderKey", "anotherHeaderValue");
            headers = myResponse.getHeaders();
            expect(headers.http.anotherHeaderKey).to.be("anotherHeaderValue");
            //check spdy
            myResponse.setHeader("headerKey2", "headerValue2", "spdy");
            headers = myResponse.getHeaders();
            expect(headers.spdy.headerKey2).to.be("headerValue2");
        });

        it("#setErrorMessage", function() {
            myResponse.setErrorMessage("My error Message");
            expect(myResponse.getErrorMessage()).to.be("My error Message");
        });

        it("#setData", function() {
            var data = { "da" : "ta" };
            myResponse.setData(data);
            expect(myResponse.getData()).to.be(data);
            expect(myResponse.getJSONData()).to.be('{"da":"ta"}');
        });
    });
});