"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    collectPages = require("../../../lib/core/collect/collectPages.js");

var dirname = __dirname;

describe("collectPages", function () {

    it("should find all page class and their templates", function () {
        var pages = collectPages(dirname + "/collectPages");

        expect(pages).to.only.have.keys(["/blog", "/blog/posts", "/home"]);
        expect(pages["/blog"]).to.be(__dirname + "/collectPages/blog/BlogPage.class.js");
        expect(pages["/blog/posts"]).to.be(__dirname + "/collectPages/blog/posts/PostsPage.class.js");
        expect(pages["/home"]).to.be(__dirname + "/collectPages/home/HomePage.html");
    });

    it("should fail on non existing folders", function () {
        expect(function () {
            collectPages(dirname + "/non/existing/folder/");
        }).to.throwError();
    });

});