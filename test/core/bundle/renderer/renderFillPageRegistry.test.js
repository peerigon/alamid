"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    pathUtil = require("path"),
    renderFillPageRegistry = require("../../../../lib/core/bundle/renderer/renderFillPageRegistry.js"),
    vm = require("vm");

var pagesPath = pathUtil.join(__dirname, "../../collect/collectPages"),
    rootPath = pagesPath;

describe("renderFillPageRegistry", function () {
    var registry = {},
        sandbox = {
            require: function (path) {
                if (/PageLoader\.class/i.test(path)) {
                    return {
                        bundles: registry
                    };
                } else {
                    return path;
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
        expect(registry["/blog"]).to.be("bundle?lazy!" + pagesPath + "/blog/BlogPage.class.js");
        expect(registry["/blog/posts"]).to.be("bundle?lazy!" + pagesPath + "/blog/posts/PostsPage.class.js");
        expect(registry["/home"]).to.be("bundle?lazy!raw!" + pagesPath + "/home/HomePage.html");
    });
});
