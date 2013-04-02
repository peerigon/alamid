"use strict"; // run code in ES5 strict mode

var expect = require("../testHelpers/expect.jquery.js"),
    Page = require("../../lib/client/Page.class.js"),
    PageController = require("../../lib/client/PageController.class.js"),
    PageLoader = require("../../lib/client/PageLoader.class.js");

function checkFor(Error) {
    return function (err) {
        expect(err).to.be.a(Error);
    };
}

describe("PageController", function () {
    var pageController,
        main,
        blog,
        posts,
        about,
        contact,
        Blog = Page.extend("Blog"),
        Posts = Page.extend("Posts"),
        About = Page.extend("About"),
        Contact = Page.extend("Contact");

    function removeAllListeners() {
        main.removeAllListeners();
        blog.removeAllListeners();
        posts.removeAllListeners();
    }

    before(function () {
        PageLoader.bundles["/about"] =  function (callback) {
            callback(About);
        };
        PageLoader.bundles["/about/contact"] = function (callback) {
            callback(Contact);
        };
        PageLoader.bundles["/blog"] = function (callback) {
            callback(Blog);
        };
    });
    beforeEach(function () {
        main = new Page();
        blog = new Blog();
        posts = new Posts();
        about = new About();
        pageController = new PageController(main);
    });

    describe("#constructor()", function () {

        it("should set the given main page", function () {
            pageController = new PageController(main);
            expect(pageController.mainPage).to.be(main);
        });
        it("should throw an error if no main page was given", function () {
            expect(function () {
                pageController = new PageController();
            }).to.throwError(checkFor(TypeError));
        });

    });

    describe("#getCurrentPages()", function () {
        var pages;

        it("should return an empty array if there are no sub-pages", function () {
            pages = pageController.getCurrentPages();
            expect(pages).to.be.an(Array);
            expect(pages).to.have.length(0);
        });
        it("should return an array with the current page hierarchy", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            expect(pageController.getCurrentPages()).to.eql([blog, posts]);
            blog.setSubPage(about);
            expect(pageController.getCurrentPages()).to.eql([blog, about]);
        });

    });

    /*
    describe("#setSubPages()", function () {

        it("should set all pages according to the given array", function () {
            main.setSubPages([blog, posts]);
            expect(main.getSubPage()).to.be(blog);
            expect(blog.getSubPage()).to.be(posts);
        });

        it("should remove pages that are not in the given array", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            main.setSubPages([]);
            expect(main.getSubPage()).to.be(null);
            expect(blog.getSubPage()).to.be(null);
        });

        it("should be possible to remove all sub-pages by passing null", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            main.setSubPages(null);
            expect(main.getSubPage()).to.be(null);
            expect(blog.getSubPage()).to.be(null);
        });

        it("should not re-set pages that are in both arrays", function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
            blog.setSubPage = function () {
                throw new Error("This function should not be called");
            };
            main.setSubPages([blog, posts, about]);
            expect(posts.getSubPage()).to.be(about);
        });

        it("should be chainable", function () {
            expect(main.setSubPages([])).to.be(main);
        });

    });*/

    describe("#show()", function () {
        var originalLoad = PageLoader.prototype.load,
            originalCancel = PageLoader.prototype.cancel;

        beforeEach(function () {
            main.setSubPage(blog);
            blog.setSubPage(posts);
        });

        afterEach(function () {
            PageLoader.prototype.load = originalLoad;
            PageLoader.prototype.cancel = originalCancel;
        });

        it("should emit 'beforePageChange' first and than 'beforeUnload' on every Sub-Page that will be changed from bottom to top", function () {
            var emitted = [],
                ctx = {};

            pageController.on("beforePageChange", function (event) {
                expect(event.context).to.be(ctx);
                expect(event.target).to.be(pageController);
                expect(event.name).to.be("BeforePageChange");
                emitted.push("pageController");
            });
            blog.on("beforeUnload", function (event) {
                expect(event.context).to.be(ctx);
                expect(event.target).to.be(pageController);
                expect(event.name).to.be("BeforeUnload");
                emitted.push("blog");
            });
            posts.on("beforeUnload", function (event) {
                expect(event.context).to.be(ctx);
                expect(event.target).to.be(pageController);
                expect(event.name).to.be("BeforeUnload");
                emitted.push("posts");
            });
            main.on("beforeUnload", function () {
                throw new Error("This event should never be emitted because the main page can't be left");
            });

            pageController.show("about", ctx);
            expect(emitted).to.eql(["pageController", "posts", "blog"]);
        });

        it("should immediately cancel the process when calling event.preventDefault()", function () {
            var ctx = {};

            function throwError() {
                throw new Error("This function should not be called");
            }

            PageLoader.prototype.load = throwError;

            pageController.on("beforePageChange", function (event) {
                event.preventDefault();
            });
            blog.on("beforeUnload", throwError);
            posts.on("beforeUnload", throwError);
            pageController.show("about", ctx);
            removeAllListeners();

            blog.on("beforeUnload", throwError);
            posts.on("beforeUnload", function (event) {
                event.preventDefault();
            });
            pageController.show("about", ctx);
            removeAllListeners();
        });

        it("should cancel() the previous pageLoader that is still running", function (done) {
            PageLoader.prototype.load = function () {
                // never call back
            };
            PageLoader.prototype.cancel = done;

            pageController.show("about", {});
            pageController.show("blog", {});
        });

        it("should emit 'pageChange' if it has finished", function (done) {
            var ctx = {};

            pageController.on("pageChange", function (event) {
                expect(event.target).to.be(pageController);
                expect(event.context).to.be(ctx);
                expect(event.name).to.be("PageChange");
                done();
            });

            pageController.show("about", ctx);
        });

        it("should accept all combinations of trailing or leading slashes", function (done) {
            var called = 0;

            pageController.on("pageChange", function onPageChange() {
                if (++called === 3) {
                    done();
                }
            });

            pageController.show("blog");
            pageController.show("about/");
            pageController.show("/blog/");
        });

        it("should be possible to change current page to MainPage with '/' as route", function (done) {
            var pages;

            pageController.on("pageChange", function () {
                pages = pageController.getCurrentPages();
                expect(pages).to.have.length(0);
                done();
            });

            pageController.show("/", {});
        });

        it("should be possible to change current page to MainPage with '' as route", function (done) {
            var pages;

            pageController.on("pageChange", function () {
                pages = pageController.getCurrentPages();
                expect(pages).to.have.length(0);
                done();
            });

            pageController.show("", {});
        });

        it("should append all loaded pages from top to bottom", function () {
            pageController.show("about/contact", {});
            about = main.getSubPage();
            contact = about.getSubPage();
            expect(about).to.be.an(About);
            expect(contact).to.be.a(Contact);

            pageController.show("/blog", {});
            blog = main.getSubPage();
            expect(blog).to.be.a(Blog);

            pageController.show("/", {});
            expect(main.getSubPage()).to.be(null);

            pageController.show("about", {});
            about = main.getSubPage();
            expect(about).to.be.an(About);
        });

    });

});
