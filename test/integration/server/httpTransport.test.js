"use strict";

var path = require("path"),
    expect = require("expect.js"),
    request = require("supertest");

require("nodeclass").registerExtension();

var runTestServerNew = require("../setup/testServerEmbeddable.js");

describe("handleHttp", function() {

    describe("#Basic Requesting", function() {

        var app;

        before(function() {
            app = runTestServerNew({ appDir : path.resolve(__dirname, "../setup/testApp")});
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
            it("should hand the request on to the service-route", function (done) {
                this.timeout(100000);
                request(app)
                    .post("/services/myNonExistentService/")
                    .type("application/json")
                    .send({ da : "ta" })
                    .expect(400,/No service found for/, done);
            });
        });

        describe("#onValidatorRequest", function(){
            it("should hand the request on to the validator-route with POST request", function (done) {
                this.timeout(100000);
                request(app)
                    .post("/validators/myNonExistentValidator/")
                    .set('Content-Type', 'application/json')
                    .send({ da : "ta" })
                    .expect(400,/found for/, done);
            });
        });

    });
});