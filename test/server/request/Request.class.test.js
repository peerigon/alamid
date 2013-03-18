"use strict";

var expect = require("expect.js"),
    Request = require("../../../lib/server/request/Request.class.js");

describe("Request", function () {

    var myRequest;
    var method = "create",
        path = "services/blogpost",
        data = { "da" : "ta" };

    describe("#Construct", function () {

        it("should set the given values as attributes", function () {
            myRequest = new Request(method, path, data);
            expect(myRequest.getMethod()).to.be(method);
            expect(myRequest.getPath()).to.be("blogpost");
            expect(myRequest.data).to.be(data);
            expect(myRequest.model).to.be(null);
        });
    });

    describe("#setPath", function () {

        var myRequest2;

        before(function () {
            myRequest2 = new Request(method, path, data);
        });

        it("Should normalize the path removing ../ and ./", function () {
            expect(myRequest2.getPath()).to.be("blogpost");
            myRequest2.setPath("services/blogpost/comment/..");
            expect(myRequest2.getPath()).to.be("blogpost");
        });

        it("should remove trailing slashes", function () {
            myRequest2.setPath("services/users/");
            expect(myRequest2.getPath()).to.be("users");
        });

        it("should remove slashes at the beginning", function () {
            myRequest2.setPath("/services/users/");
            expect(myRequest2.getPath()).to.be("users");
        });

        it("should make the path lowecase", function () {
            myRequest2.setPath("/services/Users/");
            expect(myRequest2.getPath()).to.be("users");
        });

        it("should remove ids from urls", function () {
            myRequest2.setPath("/services/users/123/comments");
            expect(myRequest2.getPath()).to.eql("users/comments");
            expect(myRequest2.ids).to.eql({ "users" : 123 });
            myRequest2.setPath("/services/users/123");
            expect(myRequest2.getPath()).to.eql("users");
            expect(myRequest2.ids).to.eql({ "users" : 123 });
            myRequest2.setPath("/services/users/123/comments/234");
            expect(myRequest2.getPath()).to.eql("users/comments");
            expect(myRequest2.ids).to.eql({ "users" : 123, "users/comments" : 234 });
        });
    });

    describe("#setMethod", function () {

        var myRequest3;

        before(function () {
            myRequest3 = new Request(method, path, data);
        });

        it("should only set allowed methods", function () {
            myRequest3.setMethod("create");
            myRequest3.setMethod("update");
            myRequest3.setMethod("read");
            myRequest3.setMethod("destroy");
        });

        it("should also set allowed methods written in highercase", function () {
            myRequest3.setMethod("CREATE");
            myRequest3.setMethod("READ");
            myRequest3.setMethod("UPDATE");
            myRequest3.setMethod("DESTROY");
        });

        it("should not allow you to set wrong methods and throw error", function () {
            myRequest3.setMethod("create");
            expect(function () {
                myRequest3.setMethod("easy");
            }).to.throwError();
        });
    });

    describe("#ids", function () {

        var myRequest;

        before(function () {
            myRequest = new Request(method, path, data);
        });

        it("should determine the ids contained in the request", function () {
            myRequest.setPath("services/blogpost/123/comment/1234");
            expect(myRequest.ids).to.eql({ "blogpost" : '123', "blogpost/comment" : '1234' });
        });

        it("should not add ids without values", function () {
            myRequest.setPath("services/blogpost/123");
            expect(myRequest.ids).to.eql({ "blogpost" : '123'});

            myRequest.setPath("services/blogpost/123/comments");
            expect(myRequest.ids).to.eql({ "blogpost" : '123'});
        });
    });

    describe("#model", function () {

        var myRequest;

        before(function () {
            myRequest = new Request(method, path, data);
        });

        it("should set the model if type = object", function () {
            myRequest.model = { "my" : "modelObject"};
            expect(myRequest.model).to.eql({ "my" : "modelObject"});
        });
    });

    describe("#session", function () {

        var myRequest;

        before(function () {
            myRequest = new Request(method, path, data);
        });

        it("should set the session", function () {

            var fakeSession = { "sessionData" : "sessionValue" };

            myRequest.session = fakeSession;
            expect(myRequest.session).to.be(fakeSession);
        });
    });

    describe("#getType", function () {

        var myRequest;

        before(function () {
            myRequest = new Request(method, path, data);
        });

        it("should determine services path", function () {
            myRequest.setPath("services/blogpost/123/comment/1234");
            expect(myRequest.getType()).to.be("service");
        });

        it("should determine services path", function () {
            myRequest.setPath("validators/blogpost");
            expect(myRequest.getType()).to.be("validator");
        });
    });

    describe("middler compatibility", function () {

        it("should expose the http method via property access .method", function () {

            myRequest = new Request();
            myRequest.method = "create";

            expect(myRequest.getMethod()).to.eql("create");
            expect(myRequest.method).to.eql("POST");
        });

        it("should expose the original-requests url via property-access .url", function () {
            myRequest = new Request(method, "/req/path");
            expect(myRequest.url).to.eql("/req/path");
        });
    });
});