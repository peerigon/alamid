"use strict";


var expect = require("expect.js"),
    rewire = require("rewire"),
    nodeclass = require("nodeclass");

nodeclass.registerExtension();

var log = require("../../../../lib/shared/logger.js").get("server"),
    Request = require("../../../../lib/server/request/Request.class.js"),
    Response = require("../../../../lib/server/request/Response.class.js"),
    Dog = require("./runService/src/Dog.class.js");

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
                return Dog;
            }
        };
        loadModel = rewire("../../../../lib/server/request/middleware/loadModel.js", false);
        loadModel.__set__("models", modelsMock);
    });

    describe("Autoloading", function() {
        it("should try to load a model if model was not defined before", function (done) {
            function next(err, req) {
                expect(err).to.be(null);
                expect(req.getIds()).to.eql({});
                expect(req.getModel().get).to.be.a("function");
                done();
            }
            loadModelTestHelper("create", "services/blogpost", next);
        });

        it("should skip autoloading if model was defined before", function (done) {

            var myRequest = new Request("create", "services/blog");
            var myResponse = new Response();
            myRequest.setModel(new Dog(123));

            loadModel(myRequest, myResponse, function(err) {
                //tiny hack to be compliant with middleware handling
                if(err === undefined) {
                    err = null;
                }
                expect(err).to.be(null);
                expect(myRequest.getIds()).to.eql({});
                expect(myRequest.getModel().getId()).to.be(123);
                done();
            });
        });
    });

    describe("Method-Model resolving", function() {
        describe("#CREATE", function() {
            it("should return a new instance without passed ID", function (done) {

                function next(err, req) {
                    expect(err).to.be(null);
                    expect(req.getIds()).to.eql({});
                    expect(req.getModel().get).to.be.a("function");
                    done();
                }
                loadModelTestHelper("create", "services/blogpost", next);
            });

            it("should return an Error with passed ID via url", function (done) {

                function next(err, req) {
                    expect(err.message).to.contain("'create' does not accept IDs");
                    expect(req.getModel()).to.be(null);
                    expect(req.getIds()).to.eql({ "blogpost" : '1234' } );
                    done();
                }
                loadModelTestHelper("create", "services/blogpost/1234", next);
            });
        });

        describe("#UPDATE", function() {
            it("should return a new instance with passed ID", function (done) {

                function next(err, req) {
                    expect(err).to.be(null);
                    expect(req.getModel().get).to.be.a("function");
                    expect(req.getModel().getId()).to.eql(1234);
                    expect(req.getIds()).to.eql({ "blogpost" : 1234 });
                    done();
                }
                loadModelTestHelper("update", "services/blogpost/1234", next);
            });

            it("should return an Error without passed ID", function (done) {

                function next(err, req) {
                    expect(req.getIds()).to.eql({});
                    expect(req.getModel()).to.be(null);
                    expect(err.message).to.contain("'update' : Missing IDs");
                    done();
                }
                loadModelTestHelper("update", "services/blogpost", next);
            });
        });
    });
});
