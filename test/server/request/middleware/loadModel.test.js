"use strict";

require("../../../testHelpers/compileTestAlamid");

var expect = require("expect.js"),
    Request = require("../../../../compiled/server/request/Request.class.js"),
    Response = require("../../../../compiled/server/request/Response.class.js"),
    loadModel = require("../../../../compiled/server/request/middleware/loadModel.js");

function loadModelTestHelper(method, path, callback) {

    var myRequest = new Request(method, path);
    var myResponse = new Response();

    loadModel(myRequest, myResponse, function(err) {
        //tiny hack to be compliant with middleware handling
        if(err === undefined) {
            err = null;
        }
        callback(err, myRequest, myResponse);
    });
}

describe("loadModel", function () {

    describe("#READ", function() {

        it("should return a new instance with passed ID", function (done) {

            function next(err, req) {
                expect(req.getIds()).to.eql({ "blogpost" : 1234 });
                expect(err).to.be(null);
                done();
            }
            loadModelTestHelper("read", "/services/blogpost/1234", next);
        });


        it("should return a new instance without passed ID", function (done) {

            function next(err, req) {
                expect(err).to.be(null);
                expect(req.getIds()).to.eql({});
                done();
            }
            loadModelTestHelper("read", "/services/blogpost", next);
        });

    });


    describe("#UPDATE", function() {

        it("should return a new instance with passed ID", function (done) {

            function next(err, req) {
                expect(err).to.be(null);
                expect(req.getIds()).to.eql({ "blogpost" : 1234 });
                done();
            }

            loadModelTestHelper("update", "/services/blogpost/1234", next);
        });

        it("should return an Error without passed ID", function (done) {

            function next(err, req) {
                expect(req.getIds()).to.eql({});
                expect(err).not.to.be(null);
                done();
            }

            loadModelTestHelper("update", "/services/blogpost", next);
        });
    });

    describe("#DELETE", function() {
        it("should return a new instance with passed ID", function (done) {

            function next(err, req) {
                expect(err).to.be(null);
                expect(req.getIds()).to.eql({ 'blogpost' : 1234 });
                done();
            }

            loadModelTestHelper("delete", "/services/blogpost/1234", next);
        });

        it("should return an Error without passed ID", function (done) {

            function next(err, req) {
                expect(err).not.to.be(null);
                expect(req.getIds()).to.eql({});
                done();
            }

            loadModelTestHelper("delete", "/services/blogpost", next);
        });
    });

    describe("#CREATE", function() {

        it("should return a new instance without passed ID", function (done) {

            function next(err, req) {
                expect(err).to.be(null);
                expect(req.getIds()).to.eql({});
                done();
            }

            loadModelTestHelper("create", "/services/blogpost", next);
        });

        it("should return an Error with passed ID via url", function (done) {

            function next(err, req) {
                expect(err).not.to.be(null);
                expect(req.getIds()).to.eql({ "blogpost" : '1234' } );
                done();
            }

            loadModelTestHelper("create", "/services/blogpost/1234", next);
        });
    });

});