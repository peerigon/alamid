"use strict"; // run code in ES5 strict mode

var expect = require("expect.js"),
    renderFillPageRegistry = require("../../../../lib/core/bundle/renderer/renderFillPageRegistry.js"),
    vm = require("vm");

var pagesPath = __dirname + "/renderFillPageRegistry",
    rootPath = pagesPath;


describe("renderFillPageRegistry", function () {
    var registry = {},
        sandbox = {
            require: function (path) {
                if (path.indexOf("alamid/lib/client/registries/pageRegistry.js") !== -1) {
                    return {
                        setPage: function setPage(pageURL, pageBundle, pageDataLoader) {
                            registry[pageURL] = {
                                bundle: pageBundle,
                                dataLoader: pageDataLoader
                            };
                        }
                    };
                }

                return function (callback) {
                    callback(path); // returning the path for testing purposes
                };
            },
            console: console
        };

    it("should throw no error", function () {
        var src = renderFillPageRegistry(rootPath, pagesPath);

        vm.runInNewContext(src, sandbox);
    });
    it("should only register 'blog', 'blog/posts' and 'home'", function () {
        expect(registry).to.only.have.keys(["blog", "blog/posts", "home"]);
    });
    it("should register the page bundles", function () {
        registry["blog"].bundle(function (path) {
            expect(path).to.be("bundle?lazy!" + pagesPath + "/blog/BlogPage.class.js");
        });
        registry["blog/posts"].bundle(function (path) {
            expect(path).to.be("bundle?lazy!" + pagesPath + "/blog/posts/PostsPage.class.js");
        });
        // We have to test "home" differently because we don't have a HomePage.class.js
        // The HomePage is not bundled lazily because it is wrapped by loadTemplate()
        registry["home"].bundle(function (path) {
            expect(path).to.be("bundle?lazy!raw!" + pagesPath + "/home/HomePage.html");
        });
    });
    it("should register the data loader of 'blog'", function () {
        registry["blog"].dataLoader(function (path) {
            expect(path).to.be(pagesPath + "/blog/blogPageDataLoader.js");
        });
    });
});
