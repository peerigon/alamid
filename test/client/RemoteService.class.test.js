"use strict";

var expect = require("expect.js"),
    rewire = require("rewire"),
    Model = require("../../lib/shared/Model.class.js");

describe("RemoteService", function () {

    var RemoteService = rewire("../../lib/client/RemoteService.class.js"),
        Post = Model.extend({
            url : "blog/post"
        }),
        postData = {
            title : "Hello World"
        },
        remoteService,
        post,
        PostSchema = {
            title : String,
            author : String
        };

    beforeEach(function () {
        post = new Post();
        post.setSchema(PostSchema);
    });

    it("should pass the right data to the dom-adapter request", function (done) {
        var ids = {
            "blog" : 1
        };

        post.set(postData);
        post.setIds(ids);

        RemoteService.__set__("request", function (method, url, model, callback) {
            expect(method).to.be("create");
            expect(url).to.contain("services/blog/1/post");
            expect(model).to.eql(postData);
            callback();
        });
        remoteService = new RemoteService("blog/post");

        remoteService.create(true, ids, post, function (response) {
            done();
        });
    });

    it("should incorporate all ids into the request url", function (done) {
        var ids = {
            "blog" : 1,
            "blog/post" : 1
        };

        post.set(postData);
        post.setIds(ids);

        RemoteService.__set__("request", function (method, url, model, callback) {
            expect(method.toLowerCase()).to.be("update");
            expect(url).to.contain("services/blog/1/post/1");
            expect(model).to.eql(postData);
            callback();
        });
        remoteService = new RemoteService("blog/post");

        remoteService.update(true, ids, post, function (response) {
            done();
        });
    });

    it("should pass only changedData to the request-adapter", function (done) {
        var ids = {
                "blog" : 1,
                "blog/post" : 1
            },
            newData = {
                author : "sbat"
            };

        post.set(postData);
        post.setIds(ids);
        post.accept();
        post.set("author", "sbat");

        RemoteService.__set__("request", function (method, url, model, callback) {
            expect(model).to.eql(newData);
            callback();
        });
        remoteService = new RemoteService("blog/post");

        remoteService.update(true, ids, post, function (response) {
            done();
        });
    });

    it("should pass only attributes defined on the sharedSchema to the request-adapter", function (done) {
        var ids = {
                "blog" : 1,
                "blog/post" : 1
            },
            newData = {
                author : "sbat",
                title : "Hi World"
            };

        post.setSchema({ author : String }, "shared");
        post.setSchema({ author : String, title : String }, "local");
        post.setIds(ids);
        post.set(newData);

        RemoteService.__set__("request", function (method, url, model, callback) {
            expect(model).to.eql({
                author : "sbat"
            });
            callback();
        });
        remoteService = new RemoteService("blog/post");

        remoteService.create(true, ids, post, function (response) {
            done();
        });
    });

    it("should strip non-writeable fields before passing the data to the request-adapter", function (done) {
        var ids = {
                "blog" : 1,
                "blog/post" : 1
            },
            newData = {
                author : "sbat",
                title : "Hi World"
            };

        post.setSchema({
            author : String,
            title : {
                type : String,
                writeable : false
            }
        }, "shared");

        post.setIds(ids);
        post.set(newData);

        RemoteService.__set__("request", function (method, url, model, callback) {
            expect(model).to.eql({
                author : "sbat"
            });
            callback();
        });
        remoteService = new RemoteService("blog/post");

        remoteService.create(true, ids, post, function (response) {
            done();
        });

    });
});