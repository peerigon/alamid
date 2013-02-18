"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    pathUtil = require("path"),
    renderFillPageRegistry = require("../../../../lib/core/bundle/renderer/renderFillPageRegistry.js"),
    pageRegistry = require("../../../../lib/client/registries/pageRegistry.js"),
    vm = require("vm");

var pagesPath = pathUtil.join(__dirname, "../../collect/collectPages"),
    rootPath = pagesPath;

describe("renderFillPageRegistry", function () {
    var sandbox = {
            require: function (path) {
                if (path === "alamid/lib/client/registries/pageRegistry.js") {
                    return pageRegistry;
                } else {
                    return function (callback) {
                        callback(path); // returning the path for testing purposes
                    };
                }
            },
            console: console
        };

    it("should throw no error", function () {
        var src = renderFillPageRegistry(rootPath, pagesPath);

        vm.runInNewContext(src, sandbox);
    });
    it("should only register '/blog', '/blog/posts' and '/home'", function () {
        expect(registry).to.only.have.keys(["/blog", "/blog/posts", "/home"]);
    });
    it("should register the page bundles", function () {
        registry["/blog"].bundle(function (path) {
            expect(path).to.be("bundle?lazy!" + pagesPath + "/blog/BlogPage.class.js");
        });
        registry["/blog/posts"].bundle(function (path) {
            expect(path).to.be("bundle?lazy!" + pagesPath + "/blog/posts/PostsPage.class.js");
        });
        registry["/home"].bundle(function (path) {
            expect(path).to.be("bundle?lazy!raw!" + pagesPath + "/home/HomePage.html");
        });
    });
});
