"use strict";

var expect = require("expect.js"),
    Response = require("../../../lib/server/request/Response.class.js");

describe("Response", function() {

    describe("#Setters & #Getters", function() {

        var myResponse;

        beforeEach(function() {
            myResponse = new Response();
        });

        it("should return statsCode 200 and headers should be an object on init", function() {
            expect(myResponse.getStatusCode()).to.be(200);
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
            expect(myResponse.getStatusCode()).to.be(200);
            myResponse.setStatusCode(400);
            expect(myResponse.getStatusCode()).to.be(400);
            myResponse.setStatusCode(418);
            expect(myResponse.getStatusCode()).to.be(418);
            myResponse.setStatus("error");
            expect(myResponse.getStatusCode()).to.be(418);
        });

        it("#getStatusCode", function() {
            expect(myResponse.getStatusCode()).to.be(200);
            myResponse.setStatus("error");
            expect(myResponse.getStatusCode()).to.be(500);
            myResponse.setStatus("success");
            expect(myResponse.getStatusCode()).to.be(200);
            myResponse.setStatus("fail");
            expect(myResponse.getStatusCode()).to.be(400);
            myResponse.setStatusCode(418);
            expect(myResponse.getStatusCode()).to.be(418);
        });

        it("#setHeader", function() {
            var headers;
            //check default
            myResponse.setHeader("headerKey", "headerValue");
            headers = myResponse.getHeaders();
            expect(headers.headerKey).to.be("headerValue");
            myResponse.setHeader("anotherHeaderKey", "anotherHeaderValue");
            headers = myResponse.getHeaders();
            expect(headers.anotherHeaderKey).to.be("anotherHeaderValue");
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

    describe("toJSendBody", function() {

        var myResponse;

        beforeEach(function() {
            myResponse = new Response();
        });

        it("should return data and status if status = success", function() {

            var testData = { "baaanschi" : "the dog"};

            myResponse.setStatus("success");
            myResponse.setData(testData);

            var resBody = myResponse.toJSendBody();
            expect(resBody.status).to.be("success");
            expect(resBody.data).to.eql(testData);
            expect(resBody.message).to.be(undefined);
        });

        it("should return data and status and maybe message if status = fail", function() {

            var testData = { "baaanschi" : "the dog"};

            myResponse.setStatus("fail");
            myResponse.setData(testData);

            var resBody = myResponse.toJSendBody();
            expect(resBody.status).to.be("fail");
            expect(resBody.data).to.eql(testData);
        });

        it("should return message and status and data if status = error", function() {

            var testData = { "baaanschi" : "the dog"};

            myResponse.setStatus("error");
            myResponse.setData(testData);
            myResponse.setErrorMessage("Something might be wrong");

            var resBody = myResponse.toJSendBody();
            expect(resBody.status).to.be("error");
            expect(resBody.data).not.to.be(undefined);
            expect(resBody.message).to.be("Something might be wrong");
        });
    });
});