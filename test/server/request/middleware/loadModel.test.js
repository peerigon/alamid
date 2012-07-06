"use strict";

require("../../../testHelpers/compileTestAlamid");

var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass");

nodeclass.registerExtension();

var log = require("../../../../lib/shared/logger.js").get("server"),
    Request = require("../../../../lib/server/request/Request.class.js"),
    Response = require("../../../../lib/server/request/Response.class.js");

var DummyModel = function(id, data) {

    this.data = {};
    this.id = null;
    this.isInstance = false;

    this.init = function(ids, data) {
        this.data = data;
        this.id = id;
        this.isInstance = true;
    };

    this.getId = function() {
        return this.id;
    };

    this.getData = function() {
        return this.data;
    };

    this.init(id, data);
};

describe("loadModel", function () {

    var loadModel;
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

    before(function() {
        var modelsMock = {
            getModel : function(modelName) {
                log.debug("Loading.." + modelName);
                return DummyModel;
            }
        };
        loadModel = rewire("../../../../lib/server/request/middleware/loadModel.js", false);
        loadModel.__set__("models", modelsMock);
    });

    describe("#CREATE", function() {

        it("should return a new instance without passed ID", function (done) {

            function next(err, req) {
                expect(err).to.be(null);
                expect(req.getIds()).to.eql({});
                expect(req.getModel().isInstance).to.be(true);
                done();
            }
            loadModelTestHelper("create", "services/blogpost", next);
        });

        it("should return an Error with passed ID via url", function (done) {

            function next(err, req) {
                expect(err.message).to.contain("'create' does not accept IDs");
                expect(req.getModel()).to.be(undefined);
                expect(req.getIds()).to.eql({ "blogpost" : '1234' } );
                done();
            }
            loadModelTestHelper("create", "services/blogpost/1234", next);
        });
    });

    describe("#READ", function() {

        it("should return a new instance with passed ID", function (done) {

            function next(err, req) {
                expect(req.getIds()).to.eql({ "blogpost" : 1234 });
                expect(req.getModel().isInstance).to.be(true);
                expect(req.getModel().getId()).to.eql(1234);
                expect(err).to.be(null);
                done();
            }
            loadModelTestHelper("read", "services/blogpost/1234", next);
        });


        it("should return the model-class without passed ID", function (done) {

            function next(err, req) {
                var modelClass = req.getModel();
                expect(err).to.be(null);
                expect(modelClass).to.be.a("function");
                expect(req.getIds()).to.eql({});
                done();
            }
            loadModelTestHelper("read", "services/blogpost", next);
        });
    });


    describe("#UPDATE", function() {

        it("should return a new instance with passed ID", function (done) {

            function next(err, req) {
                expect(err).to.be(null);
                expect(req.getModel().isInstance).to.be(true);
                expect(req.getModel().getId()).to.eql(1234);
                expect(req.getIds()).to.eql({ "blogpost" : 1234 });
                done();
            }
            loadModelTestHelper("update", "services/blogpost/1234", next);
        });

        it("should return an Error without passed ID", function (done) {

            function next(err, req) {
                expect(req.getIds()).to.eql({});
                expect(req.getModel()).to.be(undefined);
                expect(err.message).to.contain("'update' : Missing IDs");
                done();
            }
            loadModelTestHelper("update", "services/blogpost", next);
        });
    });

    describe("#DELETE", function() {
        it("should return a new instance with passed ID", function (done) {

            function next(err, req) {
                expect(err).to.be(null);
                expect(req.getModel().isInstance).to.be(true);
                expect(req.getModel().getId()).to.eql(1234);
                expect(req.getIds()).to.eql({ 'blogpost' : 1234 });
                done();
            }
            loadModelTestHelper("delete", "services/blogpost/1234", next);
        });

        it("should return an error if called without id (subpath-check)", function (done) {

            function next(err, req) {
                expect(err.message).to.contain("'delete' : Missing IDs");
                expect(req.getModel()).to.be(undefined);
                expect(req.getIds()).to.eql({ "blogpost" : 123 });
                done();
            }
            loadModelTestHelper("delete", "services/blogpost/123/comments", next);
        });

        it("should return an Error without passed ID", function (done) {

            function next(err, req) {
                expect(err.message).to.contain("'delete' : Missing IDs");
                expect(req.getModel()).to.be(undefined);
                expect(req.getIds()).to.eql({});
                done();
            }
            loadModelTestHelper("delete", "/services/blogpost", next);
        });
    });
});