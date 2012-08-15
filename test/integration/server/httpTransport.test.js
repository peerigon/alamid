"use strict";

var path = require("path"),
    expect = require("expect.js"),
    request = require("supertest");

require("nodeclass").registerExtension();

var runTestServer = require("../setup/testServerEmbeddable.js");

describe("handleHttp", function() {

    describe("#Basic Requesting", function() {

        var app;

        before(function() {
            app = runTestServer({ appDir : path.resolve(__dirname, "../setup/testApp")});
        });

        describe("## INDEX.html, Landing-Request", function(){

            it("should return the index-page on '/' request", function (done) {
                this.timeout(100000);
                request(app)
                    .get('/')
                    .expect(200,/<!-- index.html -->/, done);
            });

            it("should deliver the index-page on a different init-page request", function (done) {
                this.timeout(100000);
                request(app)
                    .get('/blog')
                    .expect(200,/<!-- index.html -->/, done);
            });

            it("should return 'not found' if a non existent page was requested", function (done) {
                this.timeout(100000);
                request(app)
                    .get('/myNonExistentPage')
                    .expect(404,/Not found/, done);
            });
        });

        describe("## /pages/ Request-Handling", function() {

            it("should return the page-javascript if page exists", function (done) {
                this.timeout(100000);
                request(app)
                    .get('/pages/blog.js')
                    .expect(200,/blog.js/, done);
            });

            it("should return not-found if page-javascript does not exist", function (done) {
                this.timeout(100000);
                request(app)
                    .get('/pages/notThere.js')
                    .expect(404,/Not found/, done);
            });
        });

        describe("## /bootstrap.js", function(){
            it("should return the bootstrap-file", function (done) {
                this.timeout(100000);
                request(app)
                    .get('/bootstrap.js')
                    .expect(200,/bootstrap/, done);
            });
        });

        describe("#onServiceRequest", function(){
            it("should return an error if no schema was defined for routes (sanitize)", function (done) {
                this.timeout(100000);
                request(app)
                    .post("/services/myNonExistentService/")
                    .type("application/json")
                    .send({ da : "ta" })
                    .expect(400,/failed/, done);
            });

            it("should return an error if not service is defined for service-route", function (done) {
                this.timeout(100000);
                request(app)
                    .post("/services/user/")
                    .type("application/json")
                    .send({ da : "ta" })
                    .expect(400,/No service found for/, done);
            });

            it("should return a service-response for a defined service", function (done) {
                this.timeout(100000);
                request(app)
                    .post("/services/blog/")
                    .type("application/json")
                    .send({ da : "ta" })
                    .expect(200,/"status":"success"/, done);
            });

            it("should block the request if the content-type is wrong", function (done) {
                this.timeout(100000);
                request(app)
                    .post("/services/myNonExistentService/")
                    .set('Content-Type', 'text/plain')
                    .expect(415, done);
            });
        });

        describe("#onValidatorRequest", function(){
            it("should hand the request on to the validator-route with POST request", function (done) {
                this.timeout(100000);
                request(app)
                    .post("/validators/myNonExistentValidator/")
                    .set('Content-Type', 'application/json')
                    .send({ da : "ta" })
                    .expect(400,/failed/, done);
            });

            it("should block validator-routes with wrong content-type request", function (done) {
                this.timeout(100000);
                request(app)
                    .post("/validators/myNonExistentValidator/")
                    .set('Content-Type', 'text/plain')
                    .expect(415, done);
            });

            it("should accept validator requests only via POST", function (done) {
                this.timeout(100000);
                request(app)
                    .put("/validators/myNonExistentValidator/")
                    .set('Content-Type', 'application/json')
                    .send({ da : "ta" })
                    .expect(400,/Invalid Request: validator/, done);
            });
        });
    });
});