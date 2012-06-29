"use strict";

require("../../testHelpers/compileTestAlamid.js");

var expect = require("expect.js"),
    Request = require("../../../compiled/server/request/Request.class.js");

describe("Request", function() {

    var myRequest;
    var method = "create",
        path = "services/blogpost",
        data = { "da" : "ta" };

    describe("#Construct", function(){

        it("Should set the given values as attributes", function() {
            myRequest = new Request(method, path, data);
            expect(myRequest.getMethod()).to.be(method);
            expect(myRequest.getPath()).to.be(path);
            expect(myRequest.getData()).to.be(data);
        });
    });

    describe("#setPath", function() {

        var myRequest2;

        before(function(){
            myRequest2 = new Request(method, path, data);
        });

        it("Should normalize the path removing ../ and ./", function() {
            expect(myRequest2.getPath()).to.be("services/blogpost");
            myRequest2.setPath("services/blogpost/comment/..");
            expect(myRequest2.getPath()).to.be("services/blogpost");
        });

        it("should remove trailing slashes", function() {
            myRequest2.setPath("services/users/");
            expect(myRequest2.getPath()).to.be("services/users");
        });

        it("should remove slashes at the beginning", function() {
            myRequest2.setPath("/services/users/");
            expect(myRequest2.getPath()).to.be("services/users");
        });
    });

    describe("#setMethod", function() {

        var myRequest3;

        before(function(){
            myRequest3 = new Request(method, path, data);
        });

        it("should only set allowed methods", function() {
            myRequest3.setMethod("create");
            myRequest3.setMethod("update");
            myRequest3.setMethod("read");
            myRequest3.setMethod("delete");

        });

        it("should also set allowed methods written in highercase", function() {
            myRequest3.setMethod("CREATE");
            myRequest3.setMethod("READ");
            myRequest3.setMethod("UPDATE");
            myRequest3.setMethod("DELETE");
        });

        it("should not allow you to set wrong methods and throw error", function() {
            myRequest3.setMethod("create");
            expect(function(){ myRequest3.setMethod("easy"); }).to.throwError();
        });
    });

    describe("#getIds", function() {

        var myRequest;

        before(function(){
            myRequest = new Request(method, path, data);
        });

        it("Should determine the ids contained in the request", function() {
            myRequest.setPath("services/blogpost/123/comment/1234");
            expect(myRequest.getIds()).to.eql({ "blogpost" : '123', "comment" : '1234' });
        });

        it("Should not add ids without values", function() {
            myRequest.setPath("services/blogpost/123");
            expect(myRequest.getIds()).to.eql({ "blogpost" : '123'});

            myRequest.setPath("services/blogpost/123/comments");
            expect(myRequest.getIds()).to.eql({ "blogpost" : '123'});
        });

    });

    describe("#getType", function() {

        var myRequest;

        before(function(){
            myRequest = new Request(method, path, data);
        });

        it("Should determine services path", function() {
            myRequest.setPath("services/blogpost/123/comment/1234");
            expect(myRequest.getType()).to.be("service");
        });

        it("Should determine services path", function() {
            myRequest.setPath("validators/blogpost");
            expect(myRequest.getType()).to.be("validator");
        });
    });
});