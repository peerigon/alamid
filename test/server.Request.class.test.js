"use strict";

require("./testHelpers/compileTestAlamid.js");

var expect = require("expect.js"),
    Request = require("../compiled/server/request/Request.class.js");


describe("Request", function() {

    var myRequest;
    var method = "POST",
        path = "/services/blogpost",
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
            expect(myRequest2.getPath()).to.be("/services/blogpost");
            myRequest2.setPath("/services/blogpost/comment/..");
            expect(myRequest2.getPath()).to.be("/services/blogpost");
        });

        it("should remove trailing slashes", function() {
            myRequest2.setPath("/services/users/");
            expect(myRequest2.getPath()).to.be("/services/users");
        });
    });

    describe("#setMethod", function() {

        var myRequest3;

        before(function(){
            myRequest3 = new Request(method, path, data);
        });

        it("should only set allowed methods", function() {
            myRequest3.setMethod("POST");
            myRequest3.setMethod("PUT");
            myRequest3.setMethod("GET");
            myRequest3.setMethod("DELETE");

        });

        it("should also set allowed methods written in lowercase", function() {
            myRequest3.setMethod("post");
            myRequest3.setMethod("put");
            myRequest3.setMethod("get");
            myRequest3.setMethod("delete");
        });

        it("should not allow you to set wrong methods and preserve old state", function() {
            myRequest3.setMethod("post");
            expect(function(){ myRequest3.setMethod("easy"); }).to.throwError();
        });
    });

});