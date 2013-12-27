"use strict";

var EventEmitter = require("events").EventEmitter;

var expect = require("expect.js"),
    rewire = require("rewire"),
    Model = require("../../../lib/shared/Model.class.js"),
    ModelCache = require("../../testHelpers/ModelCache.class.js");

describe("subscribeModelHandler", function (){

    var socketMock = new EventEmitter(),
        subscribeModelHandler = rewire("../../../lib/client/helpers/subscribeModelHandler.js"),
        Post = Model.extend("Post", {
            url: "blog/post"
        }),
        modelRegistryMock = {
            getModel: function (modelUrl) {
                expect(modelUrl).to.be("blog/post");
                return Post;
            }
        },
        ids = {
            "blog": 1,
            "blog/post": 1
        },
        post,
        emittedEvent;

    subscribeModelHandler.__set__("modelRegistry", modelRegistryMock);

    function getEmittedEvent(event) {
        emittedEvent = event;
    }

    before(function () {
        subscribeModelHandler(socketMock);
    });

    beforeEach(function () {
        Post.removeAllListeners();
        post = null;
        emittedEvent = null;
    });

    it("should receive remoteCreateEvents", function () {
        var data = {
            title: "Hello World"
        };

        Post.on("remoteCreate", getEmittedEvent);

        socketMock.emit("remoteCreate", "blog/post", ids, data);

        expect(emittedEvent.target).to.be(Post);
        expect(emittedEvent.name).to.be("RemoteCreateEvent");
        expect(emittedEvent.model).to.be.a(Post);
        expect(emittedEvent.model.get("title")).to.be("Hello World");
    });

    it("should receive remoteUpdateEvents", function () {
        var data = {
            title: "What up???"
        };

        Post.on("remoteUpdate", getEmittedEvent);

        socketMock.emit("remoteUpdate", "blog/post", ids, data);

        expect(emittedEvent.target).to.be(Post);
        expect(emittedEvent.name).to.be("RemoteUpdateEvent");
        expect(emittedEvent.model).to.be.a(Post);
        expect(emittedEvent.model.get("title")).to.be("What up???");
    });

    it("should receive remoteDestroyEvents", function () {
        Post.on("remoteDestroy", getEmittedEvent);

        socketMock.emit("remoteDestroy", "blog/post", ids);

        expect(emittedEvent.target).to.be(Post);
        expect(emittedEvent.name).to.be("RemoteDestroyEvent");
        expect(emittedEvent.model).to.be(null); // we don't have a cache, so there is no instance to pass
    });

    describe("with modelCache", function () {

        beforeEach(function () {
            Post.cache = new ModelCache();
        });

        it("should store the created model in the modelCache", function () {
            var data = {
                title: "Hello World"
            };

            socketMock.emit("remoteCreate", "blog/post", ids, data);

            post = Post.cache.get(1);
            expect(post).to.be.a(Post);
            expect(post.get("title")).to.be("Hello World");
        });

        it("should update the cached instance", function () {
            var data = {
                title: "Don't know, dude"
            };

            post = new Post();
            Post.cache.set(1, post);
            Post.on("remoteUpdate", getEmittedEvent);

            socketMock.emit("remoteUpdate", "blog/post", ids, data);

            post = Post.cache.get(1);
            expect(post.get("title")).to.be("Don't know, dude");
            expect(emittedEvent.model).to.be(post);
        });

        it("should create a new instance if there is no cached instance and then add it to the cache", function () {
            var data = {
                title: "Don't know, dude"
            };

            Post.on("remoteUpdate", getEmittedEvent);

            socketMock.emit("remoteUpdate", "blog/post", ids, data);

            post = Post.cache.get(1);
            expect(post.get("title")).to.be("Don't know, dude");
            expect(emittedEvent.model).to.be(post);
        });

        it("should pass the destroyed instance to all listeners and remove it from cache", function () {
            post = new Post();
            Post.cache.set(1, post);
            Post.on("remoteDestroy", getEmittedEvent);

            socketMock.emit("remoteDestroy", "blog/post", ids);

            expect(emittedEvent.model).to.be(post);
            expect(Post.cache.get(1)).to.be(undefined);
        });

    });
});